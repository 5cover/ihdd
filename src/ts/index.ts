import * as XLSX from "xlsx-js-style";
import { requireElementById } from "./util";

const buttonMagic = requireElementById('button-magic') as HTMLButtonElement;

buttonMagic.addEventListener("click", () => {
    // STEP 1: Create a new workbook
    const wb = XLSX.utils.book_new();

    // STEP 2: Create data rows and styles
    const row = [
        { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
        { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
        { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
        { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
    ];

    // STEP 3: Create worksheet with rows; Add worksheet to workbook
    const ws = XLSX.utils.aoa_to_sheet([row]);
    XLSX.utils.book_append_sheet(wb, ws, "Styled Sheet");

    // STEP 4: Write Excel file to browser
    XLSX.writeFile(wb, "StyledExcel.xlsx");
});
