// import { useRef, useState } from "react";

// const Combobox = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const inputRef = useRef<HTMLInputElement>(null);
//   const optionRef = useRef<HTMLDivElement>;

//   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (
//       !isOpen &&
//       (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
//     ) {
//       setIsOpen(true);
//       return;
//     }
//   };

//   return (
//     <>
//       <label htmlFor="kpa" className="block font-medium">
//         Pilih KPA
//       </label>
//       <input
//         ref={inputRef}
//         type="text"
//         className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
//       />
//     </>
//   );
// };

// export default Combobox;
