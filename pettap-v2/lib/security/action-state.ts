export type ActionFieldErrors = Record<string, string[]>;

export type ActionErrorState = {
  status: "error";
  message: string;
  fieldErrors?: ActionFieldErrors;
};

export type ActionSuccessState<TData = undefined> = {
  status: "success";
  message: string;
  data?: TData;
};

export type ActionState<TData = undefined> =
  | ActionErrorState
  | ActionSuccessState<TData>
  | null;
