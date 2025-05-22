const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Google Sheets auth
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'), // Make sure this file is present in your deployment
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1bQmSdkMRbA2BMUUkcPyNpNPqnoWkvUUCHJOLw9MWPXA'; // Replace with your actual ID

app.post('/api/submit-form', async(req, res) => {
    const formData = req.body;
    console.log('Form Data Received:', formData);

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const values = [
            [
                formData.fullName,
                formData.email,
                formData.phone,
                formData.location,
                formData.businessType,
                formData.interests.join(', '),
                formData.contactMethod,
                new Date().toLocaleString()
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).json({ message: 'Error submitting form', error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});