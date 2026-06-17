import { useState } from 'react';
import { exportApi } from '../api/api';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import './Export.css';

export default function Export() {
    const [exporting, setExporting] = useState('');

    async function handleCsv() {
        setExporting('csv');
        try {
            const res = await exportApi.csv();
            const text = await res.text();
            const blob = new Blob([text], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; 
            a.download = 'expense_report.csv'; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) { console.error(err); alert('Failed to export CSV.'); }
        finally { setExporting(''); }
    }

    async function handlePdf() {
        setExporting('pdf');
        try {
            const res = await exportApi.pdf();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; 
            a.download = 'expense_report.pdf'; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) { console.error(err); alert('Failed to export PDF.'); }
        finally { setExporting(''); }
    }

    return (
        <>
            <h1 className="section-title">Export Data</h1>
            <div className="card export-card">
                <h3><Download size={20} /> Download Your Reports</h3>
                <p>Export your transaction history in CSV or PDF format for your records.</p>

                <div className="export-buttons">
                    <button className="export-btn" onClick={handleCsv} disabled={!!exporting}>
                        <div className="icon csv"><FileSpreadsheet size={24} /></div>
                        <span className="label">{exporting === 'csv' ? 'Exporting…' : 'CSV File'}</span>
                        <span className="sublabel">Spreadsheet format</span>
                    </button>

                    <button className="export-btn" onClick={handlePdf} disabled={!!exporting}>
                        <div className="icon pdf"><FileText size={24} /></div>
                        <span className="label">{exporting === 'pdf' ? 'Exporting…' : 'PDF Report'}</span>
                        <span className="sublabel">Printable format</span>
                    </button>
                </div>
            </div>
        </>
    );
}
