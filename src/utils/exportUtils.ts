import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { GeneratedTimetable } from '@/store/timetableStore';

export function exportToPDF(timetable: GeneratedTimetable, title: string = 'Timetable') {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Prepare table data
  const headers = ['Period', ...timetable.days];
  const rows = timetable.periods.map((period, index) => {
    const row = [period];
    for (const day of timetable.days) {
      const slot = timetable.grid[day]?.[index];
      if (slot && slot.subject) {
        row.push(`${slot.subject}\n${slot.teacher}\n${slot.room}`);
      } else if (slot?.isLongBreak) {
        row.push('BREAK');
      } else {
        row.push('-');
      }
    }
    return row;
  });
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249] },
    },
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportToExcel(timetable: GeneratedTimetable, title: string = 'Timetable') {
  // Prepare data
  const headers = ['Period', ...timetable.days];
  const rows = timetable.periods.map((period, index) => {
    const row: { [key: string]: string } = { Period: period };
    for (const day of timetable.days) {
      const slot = timetable.grid[day]?.[index];
      if (slot && slot.subject) {
        row[day] = `${slot.subject} - ${slot.teacher} (${slot.room})`;
      } else if (slot?.isLongBreak) {
        row[day] = 'BREAK';
      } else {
        row[day] = '-';
      }
    }
    return row;
  });
  
  // Create workbook
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
  
  // Set column widths
  const colWidths = headers.map(() => ({ wch: 30 }));
  ws['!cols'] = colWidths;
  
  // Save file
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}
