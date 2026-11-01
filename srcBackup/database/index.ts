import SQLite from 'react-native-sqlite-storage';
import type {
  Patient,
  NewPatientInput,
  Invoice,
  InvoiceItem,
  Payment,
  InvoiceSummary,
  PatientListItem,
  DashboardStats,
  ClinicSettings,
  PaymentReceipt,
} from '../types';

SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabase({name: 'vedabilling.db', location: 'default'});
  await initTables(db);
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      reg TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      therapist TEXT DEFAULT '',
      patient_reg TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      billing_type TEXT NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      payable REAL NOT NULL DEFAULT 0,
      total_paid REAL NOT NULL DEFAULT 0,
      extra_paid REAL NOT NULL DEFAULT 0,
      balance_due REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Due',
      note TEXT DEFAULT '',
      payment_receive_date TEXT DEFAULT '',
      pdf_path TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_reg) REFERENCES patients(reg)
    )
  `);
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT NOT NULL,
      name TEXT NOT NULL,
      unit_price REAL NOT NULL DEFAULT 0,
      qty INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      method TEXT NOT NULL DEFAULT 'Cash',
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS clinic_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clinic_name TEXT NOT NULL DEFAULT 'VedaMotion Care',
      tagline TEXT NOT NULL DEFAULT 'Where Every Move Heals',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      physiotherapist TEXT NOT NULL DEFAULT '',
      patient_id_format TEXT NOT NULL DEFAULT 'VMCPTREG-####',
      gst TEXT NOT NULL DEFAULT '',
      logo_uri TEXT NOT NULL DEFAULT '',
      insurance_clause TEXT NOT NULL DEFAULT ''
    )
  `);

  // Migration: add payment_receive_date column if missing
  try {
    await database.executeSql(
      `ALTER TABLE invoices ADD COLUMN payment_receive_date TEXT DEFAULT ''`,
    );
  } catch {
    // column already exists
  }

  // Migration: add date column to payments if missing
  try {
    await database.executeSql(
      `ALTER TABLE payments ADD COLUMN date TEXT DEFAULT ''`,
    );
  } catch {
    // column already exists
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

export async function insertPatient(input: NewPatientInput): Promise<Patient> {
  const database = await getDatabase();
  const reg = input.reg || `VMCPTREG-${String(Date.now()).slice(-4)}`;
  const id = (input.name || '')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4) || 'XX';
  const now = new Date().toISOString();
  const patient: Patient = {
    id,
    reg,
    name: input.name || '',
    phone: input.phone || '',
    address: input.address || '',
    createdAt: now,
    updatedAt: now,
  };
  const [suffixResult] = await database.executeSql(
    'SELECT COUNT(*) as count FROM patients WHERE id LIKE ?',
    [`${id}%`],
  );
  const count = suffixResult.rows.item(0).count || 0;
  if (count > 0) {
    patient.id = `${id}${count + 1}`;
  }
  const [dupReg] = await database.executeSql(
    'SELECT reg FROM patients WHERE reg = ?',
    [patient.reg],
  );
  if (dupReg.rows.length > 0) {
    throw new Error('already added please use different id');
  }

  await database.executeSql(
    `INSERT INTO patients (id, reg, name, phone, address, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patient.id, patient.reg, patient.name, patient.phone, patient.address, patient.createdAt, patient.updatedAt],
  );
  return patient;
}

export async function getAllPatients(): Promise<PatientListItem[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(`
    SELECT p.id, p.reg, p.name,
      COUNT(i.id) as invoices,
      COALESCE(MAX(i.created_at), p.created_at) as date
    FROM patients p
    LEFT JOIN invoices i ON i.patient_reg = p.reg
    GROUP BY p.id
    ORDER BY p.name ASC
  `);
  const items: PatientListItem[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    items.push({
      id: row.id,
      reg: row.reg,
      name: row.name,
      invoices: row.invoices,
      date: new Date(row.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      }),
    });
  }
  return items;
}

export async function getPatientByReg(reg: string): Promise<Patient | null> {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    'SELECT * FROM patients WHERE reg = ?',
    [reg],
  );
  if (results.rows.length === 0) return null;
  const row = results.rows.item(0);
  return {
    id: row.id,
    reg: row.reg,
    name: row.name,
    phone: row.phone || '',
    address: row.address || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updatePatient(
  reg: string,
  data: { name: string; phone: string; address: string; reg?: string },
): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const newReg = data.reg?.trim();
  if (newReg && newReg !== reg) {
    const [existing] = await database.executeSql(
      'SELECT reg FROM patients WHERE reg = ? AND reg != ?',
      [newReg, reg],
    );
    if (existing.rows.length > 0) {
      throw new Error('Patient ID already exists.');
    }
    await database.executeSql(
      `UPDATE invoices SET patient_reg = ? WHERE patient_reg = ?`,
      [newReg, reg],
    );
    await database.executeSql(
      `UPDATE patients SET reg = ?, name = ?, phone = ?, address = ?, updated_at = ? WHERE reg = ?`,
      [newReg, data.name, data.phone, data.address, now, reg],
    );
  } else {
    await database.executeSql(
      `UPDATE patients SET name = ?, phone = ?, address = ?, updated_at = ? WHERE reg = ?`,
      [data.name, data.phone, data.address, now, reg],
    );
  }
}

export async function insertInvoice(invoice: Invoice): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  const [dupInv] = await database.executeSql(
    'SELECT invoice_no FROM invoices WHERE invoice_no = ?',
    [invoice.invoiceNo],
  );
  if (dupInv.rows.length > 0) {
    throw new Error('already added please use different id');
  }

  await database.executeSql(
    `INSERT INTO invoices
      (id, invoice_no, invoice_date, due_date, therapist, patient_reg, patient_name,
       billing_type, total, discount, payable, total_paid, extra_paid, balance_due,
       status, note, payment_receive_date, pdf_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      invoice.id || '',
      invoice.invoiceNo || '',
      invoice.invoiceDate || '',
      invoice.dueDate || '',
      invoice.therapist || '',
      invoice.patientReg || '',
      invoice.patientName || '',
      invoice.billingType || '',
      invoice.total || 0,
      invoice.discount || 0,
      invoice.payable || 0,
      invoice.totalPaid || 0,
      invoice.extraPaid || 0,
      invoice.balanceDue || 0,
      invoice.status || 'Due',
      invoice.note || '',
      invoice.paymentReceiveDate || '',
      invoice.pdfPath || '',
      invoice.createdAt || now,
      invoice.updatedAt || now,
    ],
  );

  if (invoice.items) {
    for (const item of invoice.items) {
      await database.executeSql(
        `INSERT INTO invoice_items (invoice_id, name, unit_price, qty, unit)
         VALUES (?, ?, ?, ?, ?)`,
        [invoice.id, item.name || '', item.unitPrice || 0, item.qty || 1, item.unit || ''],
      );
    }
  }

  if (invoice.payments) {
    for (const payment of invoice.payments) {
      await database.executeSql(
        `INSERT INTO payments (invoice_id, amount, method, date)
         VALUES (?, ?, ?, ?)`,
        [invoice.id, payment.amount || 0, payment.method || 'Cash', payment.date || ''],
      );
    }
  }
}

export async function getAllInvoices(): Promise<InvoiceSummary[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(`
    SELECT i.id, i.invoice_no, i.patient_name, i.patient_reg, i.billing_type, i.payable, i.total_paid, i.status, i.invoice_date,
      COUNT(p.id) AS payment_count
    FROM invoices i
    LEFT JOIN payments p ON p.invoice_id = i.id
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `);
  const items: InvoiceSummary[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    const paid = row.total_paid || 0;
    const payable = row.payable || 0;
    let displayStatus = row.status;
    if (paid >= payable) displayStatus = 'Paid';
    else if (paid > 0) displayStatus = 'Partial';
    else displayStatus = 'Unpaid';
    let invoicePayments: {amount: number; method: string}[] = [];
    if (row.payment_count > 0) {
      const [payResults] = await database.executeSql(
        'SELECT amount, method FROM payments WHERE invoice_id = ? ORDER BY id ASC',
        [row.id],
      );
      for (let j = 0; j < payResults.rows.length; j++) {
        const pr = payResults.rows.item(j);
        invoicePayments.push({amount: pr.amount || 0, method: pr.method || 'Cash'});
      }
    }
    items.push({
      id: row.id,
      name: row.patient_name,
      reg: row.patient_reg || '',
      invoice: row.invoice_no,
      type: row.billing_type,
      amount: `₹${Number(payable).toLocaleString('en-IN')}`,
      payable,
      totalPaid: paid,
      paymentCount: row.payment_count || 0,
      payments: invoicePayments,
      status: displayStatus,
      date: row.invoice_date || '',
    });
  }
  return items;
}

export async function getInvoicesByPatient(reg: string): Promise<InvoiceSummary[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    `SELECT i.id, i.invoice_no, i.patient_name, i.patient_reg, i.billing_type, i.payable, i.total_paid, i.status, i.invoice_date,
      COUNT(p.id) AS payment_count
     FROM invoices i
     LEFT JOIN payments p ON p.invoice_id = i.id
     WHERE i.patient_reg = ?
     GROUP BY i.id
     ORDER BY i.created_at DESC`,
    [reg],
  );
  const items: InvoiceSummary[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    const paid = row.total_paid || 0;
    const payable = row.payable || 0;
    let displayStatus = row.status;
    if (paid >= payable) displayStatus = 'Paid';
    else if (paid > 0) displayStatus = 'Partial';
    else displayStatus = 'Unpaid';
    let invoicePayments: {amount: number; method: string}[] = [];
    if (row.payment_count > 0) {
      const [payResults] = await database.executeSql(
        'SELECT amount, method FROM payments WHERE invoice_id = ? ORDER BY id ASC',
        [row.id],
      );
      for (let j = 0; j < payResults.rows.length; j++) {
        const pr = payResults.rows.item(j);
        invoicePayments.push({amount: pr.amount || 0, method: pr.method || 'Cash'});
      }
    }
    items.push({
      id: row.id,
      name: row.patient_name,
      reg: row.patient_reg || '',
      invoice: row.invoice_no,
      type: row.billing_type,
      amount: `₹${Number(payable).toLocaleString('en-IN')}`,
      payable,
      totalPaid: paid,
      paymentCount: row.payment_count || 0,
      payments: invoicePayments,
      status: displayStatus,
      date: row.invoice_date || '',
    });
  }
  return items;
}

export async function getFullInvoice(id: string): Promise<Invoice | null> {
  const database = await getDatabase();
  const [invResults] = await database.executeSql(
    'SELECT * FROM invoices WHERE id = ?',
    [id],
  );
  if (invResults.rows.length === 0) return null;
  const row = invResults.rows.item(0);

  const [itemResults] = await database.executeSql(
    'SELECT * FROM invoice_items WHERE invoice_id = ?',
    [id],
  );
  const items: InvoiceItem[] = [];
  for (let i = 0; i < itemResults.rows.length; i++) {
    const ir = itemResults.rows.item(i);
    items.push({name: ir.name, unitPrice: ir.unit_price, qty: ir.qty, unit: ir.unit || ''});
  }

  const [payResults] = await database.executeSql(
    'SELECT * FROM payments WHERE invoice_id = ?',
    [id],
  );
  const payments: Payment[] = [];
  for (let i = 0; i < payResults.rows.length; i++) {
    const pr = payResults.rows.item(i);
    payments.push({amount: pr.amount, method: pr.method, date: pr.date || ''});
  }

  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    therapist: row.therapist || '',
    patientReg: row.patient_reg,
    patientName: row.patient_name,
    billingType: row.billing_type,
    items,
    total: row.total,
    discount: row.discount,
    payable: row.payable,
    payments,
    totalPaid: row.total_paid,
    extraPaid: row.extra_paid,
    balanceDue: row.balance_due,
    status: row.status,
    note: row.note || '',
    paymentReceiveDate: row.payment_receive_date || '',
    pdfPath: row.pdf_path || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateInvoicePdfPath(
  id: string,
  pdfPath: string,
): Promise<void> {
  const database = await getDatabase();
  await database.executeSql('UPDATE invoices SET pdf_path = ? WHERE id = ?', [
    pdfPath,
    id,
  ]);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const database = await getDatabase();
  const [patResult] = await database.executeSql(
    'SELECT COUNT(*) as count FROM patients',
  );
  const totalPatients = patResult.rows.item(0).count || 0;

  const [invResult] = await database.executeSql('SELECT * FROM invoices');
  let totalInvoices = 0;
  let paidInvoices = 0;
  let unpaidInvoices = 0;
  let partialInvoices = 0;
  let totalRevenue = 0;
  let pendingAmount = 0;

  for (let i = 0; i < invResult.rows.length; i++) {
    const row = invResult.rows.item(i);
    totalInvoices++;
    const paid = row.total_paid || 0;
    const payable = row.payable || 0;
    totalRevenue += paid;
    if (paid >= payable && payable > 0) paidInvoices++;
    else if (paid > 0) partialInvoices++;
    else unpaidInvoices++;
    pendingAmount += payable - paid;
  }

  return {
    totalPatients,
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    partialInvoices,
    totalRevenue,
    pendingAmount,
  };
}

export async function getClinicSettings(): Promise<ClinicSettings | null> {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    'SELECT * FROM clinic_settings WHERE id = 1',
  );
  if (results.rows.length === 0) return null;
  const row = results.rows.item(0);
  return {
    clinicName: row.clinic_name || 'VedaMotion Care',
    tagline: row.tagline || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    physiotherapist: row.physiotherapist || '',
    patientIdFormat: row.patient_id_format || 'VMCPTREG-####',
    gst: row.gst || '',
    logoUri: row.logo_uri || '',
    insuranceClause: row.insurance_clause || '',
  };
}

export async function getNextInvoiceNo(): Promise<string> {
  const database = await getDatabase();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const fyStart = month >= 4 ? year : year - 1;
  const fy = String(fyStart).slice(-2);
  const fyEnd = String(fyStart + 1).slice(-2);
  const prefix = `VMC/INV/${fy}-${fyEnd}/`;

  const [results] = await database.executeSql(
    `SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY invoice_no DESC LIMIT 1`,
    [`${prefix}%`],
  );

  let nextNum = 1;
  if (results.rows.length > 0) {
    const last = results.rows.item(0).invoice_no;
    const parts = last.split('/');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    nextNum = (lastNum || 0) + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

export async function saveClinicSettings(settings: ClinicSettings): Promise<void> {
  const database = await getDatabase();
  await database.executeSql(
    `INSERT OR REPLACE INTO clinic_settings
      (id, clinic_name, tagline, phone, email, website, physiotherapist,
       patient_id_format, gst, logo_uri, insurance_clause)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      settings.clinicName || '',
      settings.tagline || '',
      settings.phone || '',
      settings.email || '',
      settings.website || '',
      settings.physiotherapist || '',
      settings.patientIdFormat || 'VMCPTREG-####',
      settings.gst || '',
      settings.logoUri || '',
      settings.insuranceClause || '',
    ],
  );
}

export async function getAllPayments(): Promise<PaymentReceipt[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    `SELECT py.id, py.invoice_id, py.amount, py.method, py.date,
       i.invoice_no, i.patient_name, i.patient_reg, i.invoice_date,
       i.status AS invoice_status, i.payable, i.total_paid,
       (SELECT COUNT(*) FROM payments p2 WHERE p2.invoice_id = py.invoice_id) AS payment_count,
       (SELECT COUNT(*) FROM payments p3 WHERE p3.invoice_id = py.invoice_id AND p3.id <= py.id) AS payment_index
     FROM payments py
     JOIN invoices i ON i.id = py.invoice_id
     ORDER BY i.created_at DESC, py.id ASC`,
  );
  const items: PaymentReceipt[] = [];
  for (let j = 0; j < results.rows.length; j++) {
    const row = results.rows.item(j);
    items.push({
      id: row.id,
      invoiceId: row.invoice_id,
      invoiceNo: row.invoice_no,
      patientName: row.patient_name,
      patientReg: row.patient_reg || '',
      amount: row.amount || 0,
      method: row.method || 'Cash',
      invoiceDate: row.invoice_date || '',
      invoiceStatus: row.invoice_status || '',
      payable: row.payable || 0,
      totalPaid: row.total_paid || 0,
      paymentCount: row.payment_count || 0,
      paymentIndex: row.payment_index || 1,
      paymentDate: row.date || '',
    });
  }
  return items;
}

export interface DatabaseBackup {
  vedabilling_backup: true;
  version: number;
  exported_at: string;
  app_version: string;
  tables: {
    patients: any[];
    invoices: any[];
    invoice_items: any[];
    payments: any[];
    clinic_settings: any[];
  };
}

export async function exportAllData(): Promise<DatabaseBackup> {
  const database = await getDatabase();

  const [patients] = await database.executeSql('SELECT * FROM patients');
  const [invoices] = await database.executeSql('SELECT * FROM invoices');
  const [invoiceItems] = await database.executeSql('SELECT * FROM invoice_items');
  const [payments] = await database.executeSql('SELECT * FROM payments');
  const [clinicSettings] = await database.executeSql('SELECT * FROM clinic_settings');

  const rowsToArr = (result: any) => {
    const arr = [];
    for (let i = 0; i < result.rows.length; i++) arr.push(result.rows.item(i));
    return arr;
  };

  return {
    vedabilling_backup: true,
    version: 1,
    exported_at: new Date().toISOString(),
    app_version: '1.0.0',
    tables: {
      patients: rowsToArr(patients),
      invoices: rowsToArr(invoices),
      invoice_items: rowsToArr(invoiceItems),
      payments: rowsToArr(payments),
      clinic_settings: rowsToArr(clinicSettings),
    },
  };
}

export async function importAllData(backup: DatabaseBackup): Promise<{patients: number; invoices: number; payments: number}> {
  const database = await getDatabase();

  await database.executeSql('DELETE FROM payments');
  await database.executeSql('DELETE FROM invoice_items');
  await database.executeSql('DELETE FROM invoices');
  await database.executeSql('DELETE FROM patients');
  await database.executeSql('DELETE FROM clinic_settings');

  let patientCount = 0;
  for (const p of backup.tables.patients) {
    await database.executeSql(
      `INSERT OR REPLACE INTO patients (id, reg, name, phone, address, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.reg, p.name, p.phone || '', p.address || '', p.created_at, p.updated_at],
    );
    patientCount++;
  }

  let invoiceCount = 0;
  for (const inv of backup.tables.invoices) {
    await database.executeSql(
      `INSERT OR REPLACE INTO invoices
        (id, invoice_no, invoice_date, due_date, therapist, patient_reg, patient_name,
         billing_type, total, discount, payable, total_paid, extra_paid, balance_due,
         status, note, payment_receive_date, pdf_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inv.id, inv.invoice_no, inv.invoice_date, inv.due_date, inv.therapist || '',
        inv.patient_reg, inv.patient_name, inv.billing_type, inv.total || 0,
        inv.discount || 0, inv.payable || 0, inv.total_paid || 0, inv.extra_paid || 0,
        inv.balance_due || 0, inv.status || 'Due', inv.note || '',
        inv.payment_receive_date || '', inv.pdf_path || '', inv.created_at, inv.updated_at,
      ],
    );
    invoiceCount++;
  }

  for (const item of backup.tables.invoice_items) {
    await database.executeSql(
      `INSERT OR REPLACE INTO invoice_items (id, invoice_id, name, unit_price, qty, unit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.invoice_id, item.name, item.unit_price || 0, item.qty || 1, item.unit || ''],
    );
  }

  let paymentCount = 0;
  for (const pay of backup.tables.payments) {
    await database.executeSql(
      `INSERT OR REPLACE INTO payments (id, invoice_id, amount, method, date)
       VALUES (?, ?, ?, ?, ?)`,
      [pay.id, pay.invoice_id, pay.amount || 0, pay.method || 'Cash', pay.date || ''],
    );
    paymentCount++;
  }

  for (const cs of backup.tables.clinic_settings) {
    await database.executeSql(
      `INSERT OR REPLACE INTO clinic_settings
        (id, clinic_name, tagline, phone, email, website, physiotherapist,
         patient_id_format, gst, logo_uri, insurance_clause)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cs.id || 1, cs.clinic_name || '', cs.tagline || '', cs.phone || '',
        cs.email || '', cs.website || '', cs.physiotherapist || '',
        cs.patient_id_format || 'VMCPTREG-####', cs.gst || '',
        cs.logo_uri || '', cs.insurance_clause || '',
      ],
    );
  }

  return {patients: patientCount, invoices: invoiceCount, payments: paymentCount};
}

export async function updateInvoicePayment(
  invoiceId: string,
  payments: {amount: number; method: string; date: string}[],
  totalPaid: number,
  extraPaid: number,
  balanceDue: number,
  status: string,
): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.executeSql(
    `UPDATE invoices
     SET total_paid = ?, extra_paid = ?, balance_due = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [totalPaid, extraPaid, balanceDue, status, now, invoiceId],
  );
  await database.executeSql(
    `DELETE FROM payments WHERE invoice_id = ?`,
    [invoiceId],
  );
  for (const payment of payments) {
    await database.executeSql(
      `INSERT INTO payments (invoice_id, amount, method, date) VALUES (?, ?, ?, ?)`,
      [invoiceId, payment.amount || 0, payment.method || 'Cash', payment.date || ''],
    );
  }
}
