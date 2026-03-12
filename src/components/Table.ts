import { Box, Text, TextAttributes } from "@opentui/core";

interface TableProps {
  data: Array<Record<string, unknown>>;
}

export const Table = ({ data }: TableProps) => {
  if (!data.length) {
    return Box(
      { border: true, padding: 1 },
      Text({ content: "No data", attributes: TextAttributes.DIM }),
    );
  }

  const columns = Object.keys(data[0] as Record<string, unknown>);
  
  // Calculate width of each column based on content (header vs data)
  const widths = columns.map((col) => {
    const headerLen = col.length;
    const dataLen = Math.max(...data.map((row) => String(row[col] ?? "").length), 0);
    return Math.max(headerLen, dataLen) + 2; // +2 for padding
  });
  
  // Create the table using box drawing characters
  const createBorder = (topLeft: string, topMid: string, topRight: string, 
                       midLeft: string, midMid: string, midRight: string,
                       bottomLeft: string, bottomMid: string, bottomRight: string): string => {
    // Top border
    let border = topLeft;
    for (let i = 0; i < widths.length; i++) {
      border += "═".repeat(widths[i]!);
      if (i < widths.length - 1) border += topMid;
    }
    border += topRight + "\n";
    
    // Header row
    border += "║";
    for (let i = 0; i < columns.length; i++) {
      const header = columns[i]!;
      const paddedHeader = header.padEnd(widths[i]! - 1, " ").padStart(widths[i]!, " ");
      border += paddedHeader + "║";
    }
    border += "\n";
    
    // Separator after header
    border += midLeft;
    for (let i = 0; i < widths.length; i++) {
      border += "─".repeat(widths[i]!);
      if (i < widths.length - 1) border += midMid;
    }
    border += midRight + "\n";
    
    // Data rows
    for (const row of data) {
      border += "║";
      for (let i = 0; i < columns.length; i++) {
        const value = String(row[columns[i]!] ?? "");
        const paddedValue = value.padEnd(widths[i]! - 1, " ").padStart(widths[i]!, " ");
        border += paddedValue + "║";
      }
      border += "\n";
    }
    
    // Bottom border
    border += bottomLeft;
    for (let i = 0; i < widths.length; i++) {
      border += "═".repeat(widths[i]!);
      if (i < widths.length - 1) border += bottomMid;
    }
    border += bottomRight;
    
    return border;
  };
  
  const tableContent = createBorder(
    "╔", "╤", "╗",  // Top left, mid, right
    "╟", "┼", "╢",  // Middle left, mid, right (header separator)
    "╚", "╧", "╝"   // Bottom left, mid, right
  );
  
  return Box(
    { border: false, padding: 0 },
    Text({ 
      content: tableContent
    })
  );
};