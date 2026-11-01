interface ErrorUtilsType {
  getGlobalHandler(): (error: unknown, isFatal: boolean) => void;
  setGlobalHandler(handler: (error: unknown, isFatal: boolean) => void): void;
}

declare var ErrorUtils: ErrorUtilsType;
declare var HermesInternal: {
  getPromiseRejectionTracking?: () =>
    | ((command: 'enable', handler: (reason: unknown) => void) => void)
    | undefined;
};
