const fs = require('fs');
const path = require('path');
const CommHelper = require('./communicationHelper');
const { con } = require('./database');

const NotificationService = {
    /**
     * Notify students about a newly published assignment or assessment.
     */
    async notifyNewLmsItem(schoolID, classID, sectionID, itemType, itemTitle, subjectID, dueDate, senderID) {
        try {
            const [subject] = await con.execute('SELECT Name FROM Subjects WHERE ID = ?', [subjectID]);
            const subjectName = subject[0]?.Name || 'General';
            const [school] = await con.execute('SELECT Name FROM Schools WHERE ID = ?', [schoolID]);
            const schoolName = school[0]?.Name || 'Institutional Portal';

            let studentQuery = `
                SELECT s.FirstName, s.LastName, u.Email, u.Phone 
                FROM Students s
                JOIN Users u ON s.UserID = u.ID
                WHERE s.SchoolID = ? AND s.ClassID = ? AND u.Status = 'active'
            `;
            const params = [schoolID, classID];
            if (sectionID) { studentQuery += ' AND s.SectionID = ?'; params.push(sectionID); }
            const [students] = await con.execute(studentQuery, params);

            const templatePath = path.join(__dirname, 'email-templates/assignment-notification.html');
            let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

            if (template) {
                template = template.replace(/{{itemType}}/g, itemType)
                                   .replace(/{{title}}/g, itemTitle)
                                   .replace(/{{subjectName}}/g, subjectName)
                                   .replace(/{{schoolName}}/g, schoolName)
                                   .replace(/{{deadline}}/g, new Date(dueDate).toLocaleString())
                                   .replace(/{{hostname}}/g, 'localhost')
                                   .replace(/{{linkType}}/g, itemType.toLowerCase() === 'assignment' ? 'assignments' : 'assessments');
            }

            for (const s of students) {
                if (s.Email) {
                    CommHelper.sendEmail({
                        SchoolID: schoolID,
                        SenderID: senderID,
                        Recipient: s.Email,
                        Subject: `New ${itemType}: ${itemTitle}`,
                        Html: template || `A new ${itemType} (${itemTitle}) has been posted for ${subjectName}. Deadline: ${dueDate}`
                    });
                }
                if (s.Phone) {
                    CommHelper.sendSMS({
                        SchoolID: schoolID,
                        SenderID: senderID,
                        Recipient: s.Phone,
                        Message: `Edunex: New ${itemType} Published!\nSubject: ${subjectName}\nTitle: ${itemTitle}\nDeadline: ${new Date(dueDate).toLocaleDateString()}\nPlease check your portal.`
                    });
                }
            }
        } catch (err) { console.error("[NotifService] NewLmsItem Error:", err.message); }
    },

    /**
     * Notify a student when their work is graded and published.
     */
    async notifyGradesPublished(schoolID, studentID, itemName, score, totalMarks, feedback, senderID) {
        try {
            const [student] = await con.execute(`
                SELECT s.FirstName, s.LastName, u.Email, u.Phone, sch.Name as SchoolName
                FROM Students s
                JOIN Users u ON s.UserID = u.ID
                JOIN Schools sch ON s.SchoolID = sch.ID
                WHERE s.ID = ?
            `, [studentID]);

            if (student.length === 0) return;
            const s = student[0];

            const templatePath = path.join(__dirname, 'email-templates/grade-notification.html');
            let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';
            
            if (template) {
                template = template.replace(/{{studentName}}/g, `${s.FirstName} ${s.LastName}`)
                                   .replace(/{{itemName}}/g, itemName)
                                   .replace(/{{score}}/g, score)
                                   .replace(/{{totalMarks}}/g, totalMarks)
                                   .replace(/{{feedback}}/g, feedback || 'Keep up the good work!')
                                   .replace(/{{schoolName}}/g, s.SchoolName)
                                   .replace(/{{hostname}}/g, 'localhost');
            }

            if (s.Email) {
                CommHelper.sendEmail({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: s.Email,
                    Subject: `Results Published: ${itemName}`,
                    Html: template || `Your results for ${itemName} have been published. Score: ${score}/${totalMarks}`
                });
            }
            if (s.Phone) {
                CommHelper.sendSMS({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: s.Phone,
                    Message: `Edunex: Results Published for ${itemName}!\nScore: ${score}/${totalMarks}\nLog in to view details.`
                });
            }
        } catch (err) { console.error("[NotifService] GradePublished Error:", err.message); }
    },

    /**
     * Notify parents/students about a new fee voucher.
     */
    async notifyFeeVoucher(schoolID, studentID, voucherNo, amount, billingMonth, dueDate, senderID) {
        try {
            const [student] = await con.execute(`
                SELECT s.FirstName, s.LastName, u.Email, u.Phone, sch.Name as SchoolName
                FROM Students s
                JOIN Users u ON s.UserID = u.ID
                JOIN Schools sch ON s.SchoolID = sch.ID
                WHERE s.ID = ?
            `, [studentID]);

            if (student.length === 0) return;
            const s = student[0];

            const templatePath = path.join(__dirname, 'email-templates/fee-voucher-notification.html');
            let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

            if (template) {
                template = template.replace(/{{studentName}}/g, `${s.FirstName} ${s.LastName}`)
                                   .replace(/{{billingMonth}}/g, billingMonth)
                                   .replace(/{{amount}}/g, amount)
                                   .replace(/{{dueDate}}/g, new Date(dueDate).toLocaleDateString())
                                   .replace(/{{schoolName}}/g, s.SchoolName)
                                   .replace(/{{hostname}}/g, 'localhost');
            }

            if (s.Email) {
                CommHelper.sendEmail({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: s.Email,
                    Subject: `Fee Voucher Generated: ${billingMonth}`,
                    Html: template || `Your fee voucher for ${billingMonth} has been generated. Amount: ${amount}. Due Date: ${dueDate}`
                });
            }
            if (s.Phone) {
                CommHelper.sendSMS({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: s.Phone,
                    Message: `Edunex Fee Alert: Voucher for ${billingMonth} generated for ${s.FirstName}.\nAmount: ${amount}\nDue Date: ${new Date(dueDate).toLocaleDateString()}\nPlease settle via portal.`
                });
            }
        } catch (err) { console.error("[NotifService] FeeVoucher Error:", err.message); }
    },

    /**
     * Welcome new staff members.
     */
    async notifyStaffOnboarding(schoolID, firstName, lastName, email, phone, password, senderID) {
        try {
            const [school] = await con.execute('SELECT Name FROM Schools WHERE ID = ?', [schoolID]);
            const schoolName = school[0]?.Name || 'Edunex Institution';

            const templatePath = path.join(__dirname, 'email-templates/staff-onboarding.html');
            let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

            if (template) {
                template = template.replace(/{{schoolName}}/g, schoolName)
                                   .replace(/{{firstName}}/g, firstName)
                                   .replace(/{{lastName}}/g, lastName)
                                   .replace(/{{email}}/g, email)
                                   .replace(/{{password}}/g, password)
                                   .replace(/{{hostname}}/g, 'localhost');
            }

            if (email) {
                CommHelper.sendEmail({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: email,
                    Subject: `Official Account Ready - ${schoolName}`,
                    Html: template
                });
            }
            if (phone) {
                CommHelper.sendSMS({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: phone,
                    Message: `Welcome to ${schoolName}!\nYour staff account is ready.\nEmail: ${email}\nPassword: ${password}\nPlease change password after login.`
                });
            }
        } catch (err) { console.error("[NotifService] StaffOnboarding Error:", err.message); }
    },

    /**
     * Welcome new students.
     */
    async notifyStudentOnboarding(schoolID, firstName, lastName, email, phone, password, senderID) {
        try {
            const [school] = await con.execute('SELECT Name FROM Schools WHERE ID = ?', [schoolID]);
            const schoolName = school[0]?.Name || 'Edunex Institution';

            const templatePath = path.join(__dirname, 'email-templates/student-onboarding.html');
            let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

            if (template) {
                template = template.replace(/{{schoolName}}/g, schoolName)
                                   .replace(/{{firstName}}/g, firstName)
                                   .replace(/{{lastName}}/g, lastName)
                                   .replace(/{{email}}/g, email)
                                   .replace(/{{password}}/g, password)
                                   .replace(/{{hostname}}/g, 'localhost');
            }

            if (email) {
                CommHelper.sendEmail({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: email,
                    Subject: `Welcome to ${schoolName} - Student Account`,
                    Html: template
                });
            }
            if (phone) {
                CommHelper.sendSMS({
                    SchoolID: schoolID,
                    SenderID: senderID,
                    Recipient: phone,
                    Message: `Welcome to ${schoolName}!\nYour student account is ready.\nEmail: ${email}\nPassword: ${password}\nPlease change password after login.`
                });
            }
        } catch (err) { console.error("[NotifService] StudentOnboarding Error:", err.message); }
    }
};

module.exports = NotificationService;
