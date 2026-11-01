import {useState, useCallback} from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  icon?: string;
  buttons: AlertButton[];
}

export function useReusableAlert() {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  return {config, visible, showAlert, hideAlert};
}
