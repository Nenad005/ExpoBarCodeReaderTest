import { useState } from "react";

function Random() {
  const [typeOfColor, setTypeOfColor] = useState("hex");
  const [color, setColor] = useState("#000000");

  function randomColorUtility(length : any) {
    return Math.floor(Math.random() * length);
  }

  function hexy() {
    const hex = [1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
    let hexColor = "#";
    for (let i = 0; i < 6; i++) {
      hexColor += hex[randomColorUtility(hex.length)];
    }
    setColor(hexColor);
  }

  function rgb() {
    // Implementation for RGB color generation
  }

  return (
    <div
      className="flex justify-evenly items-center mt-4 px-[30px] text-white"
      style={{ background: color, width: "100vw", height: "100vh" }}
    >
      <button onClick={() => setTypeOfColor("hex")}>Create HEX Color</button>
      <button onClick={() => setTypeOfColor("rgb")}>Create RGB Color</button>
      <button onClick={typeOfColor === "hex" ? hexy : rgb}>
        Generate Random Color
      </button>
    </div>
  );
}

export default Random;