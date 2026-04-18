// import React from "react";
// import { type FormState, initialData } from "../__types";

// export const useKehadiranForm = () => {
//   const [state, setState] = React.useState<FormState>({
//     data: initialData,
//     pegawai: null,
//     loading: false,
//     errors: {},
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     e.preventDefault();

//     const { name, value } = e.target;

//     setState((prev) => ({
//       ...prev,
//       data: {
//         ...(prev.data ?? initialData),
//         [name]: value,
//       },
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, files } = e.target;

//     if (!files?.length) return;

//     const file = files[0];

//     setState((prev) => ({
//       ...prev,
//       data: {
//         ...(prev.data ?? {}),
//         bukti_dukung: file,
//       },
//     }));
//   };
// };
