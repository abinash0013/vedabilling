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

export async function insertInvoice(invoice: Invoice): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.executeSql(
    `INSERT OR REPLACE INTO invoices
      (id, invoice_no, invoice_date, due_date, therapist, patient_reg, patient_name,
       billing_type, total, discount, payable, total_paid, extra_paid, balance_due,
       status, note, pdf_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        `INSERT INTO payments (invoice_id, amount, method)
         VALUES (?, ?, ?)`,
        [invoice.id, payment.amount || 0, payment.method || 'Cash'],
      );
    }
  }
}

export async function getAllInvoices(): Promise<InvoiceSummary[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(`
    SELECT id, invoice_no, patient_name, patient_reg, billing_type, payable, total_paid, status, invoice_date
    FROM invoices
    ORDER BY created_at DESC
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
    items.push({
      id: row.id,
      name: row.patient_name,
      reg: row.patient_reg || '',
      invoice: row.invoice_no,
      type: row.billing_type,
      amount: `₹${Number(payable).toLocaleString('en-IN')}`,
      status: displayStatus,
      date: row.invoice_date || '',
    });
  }
  return items;
}

export async function getInvoicesByPatient(reg: string): Promise<InvoiceSummary[]> {
  const database = await getDatabase();
  const [results] = await database.executeSql(
    `SELECT id, invoice_no, patient_name, patient_reg, billing_type, payable, total_paid, status, invoice_date
     FROM invoices WHERE patient_reg = ?
     ORDER BY created_at DESC`,
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
    items.push({
      id: row.id,
      name: row.patient_name,
      reg: row.patient_reg || '',
      invoice: row.invoice_no,
      type: row.billing_type,
      amount: `₹${Number(payable).toLocaleString('en-IN')}`,
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
    payments.push({amount: pr.amount, method: pr.method});
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
