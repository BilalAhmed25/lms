const { con } = require('./database');
const sendEmailHelper = require('./sendEmail');
const moment = require('moment');

/**
 * Robust centralized communication logger and dispatcher.
 * Handles SMS (via mobile app gateway), Email (via SMTP), and In-App Notifications.
 */
const CommunicationHelper = {
    /**
     * Logs any outgoing communication for institutional audit.
     */
    async log(params) {
        const { SchoolID, UserID, Recipient, Type, Subject, Message, Status = 'delivered' } = params;
        try {
            const query = `
                INSERT INTO CommunicationLogs (SchoolID, SenderID, Recipient, Type, Subject, Message, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await con.execute(query, [SchoolID, UserID, Recipient, Type, Subject || null, Message, Status]);
            return result.insertId;
        } catch (error) {
            console.error("[CommHelper ERROR] Logging failed:", error.message);
            return null;
        }
    },

    /**
     * Dispatches an SMS through the School Admin's physical device gateway.
     */
    async sendSMS(params) {
        const { SchoolID, SenderID, Recipient, Message } = params;
        try {
            // Find all active School Admins for this school to route the socket
            const [admins] = await con.execute(
                'SELECT ID FROM Users WHERE SchoolID = ? AND RoleID = 2 AND Status = "active"',
                [SchoolID]
            );

            if (admins.length === 0) {
                console.warn(`[CommHelper] No active School Admin found for SchoolID: ${SchoolID}. SMS not dispatched.`);
                return false;
            }

            if (global.io) {
                // Log the attempt
                const logId = await this.log({
                    SchoolID,
                    UserID: SenderID,
                    Recipient,
                    Type: 'SMS',
                    Message,
                    Status: 'dispatched'
                });

                // Emit to the unified School Mobile App Gateway path
                global.io.to(`school:${SchoolID}`).emit('sms:send', {
                    recipient: Recipient,
                    message: Message,
                    logId: logId,
                    timestamp: new Date().toISOString()
                });

                return true;
            } else {
                console.warn("[CommHelper] Socket.io not initialized.");
                return false;
            }
        } catch (error) {
            console.error("[CommHelper] SMS send failed:", error.message);
            return false;
        }
    },

    // Alias for legacy support
    async dispatchSMS(userID, recipient, message) {
        // Find SchoolID for this user to use the new robust logic
        const [user] = await con.execute('SELECT SchoolID FROM Users WHERE ID = ?', [userID]);
        if (user.length === 0) return false;
        
        return this.sendSMS({
            SchoolID: user[0].SchoolID,
            SenderID: userID,
            Recipient: recipient,
            Message: message
        });
    },

    /**
     * Sends an email and logs it.
     */
    async sendEmail(params) {
        const { SchoolID, SenderID, Recipient, Subject, Message, Html, Config } = params;
        try {
            const isSent = await sendEmailHelper(process.env.SMTP_USER, Recipient, Subject, Html || Message, [], Config);

            await this.log({
                SchoolID,
                UserID: SenderID,
                Recipient,
                Type: 'Email',
                Subject,
                Message: Html || Message,
                Status: isSent ? 'sent' : 'failed'
            });
            return isSent;
        } catch (error) {
            console.error("[CommHelper] Email send failed:", error.message);
            return false;
        }
    },

    /**
     * In-App Notifications Functionality (Ported from legacy notificationHelper)
     */
    async sendNotification({ Message, Recipients, Type = 'message', FileUrl = null, FileExtension = null }) {
        try {
            let recipientCsv = Array.isArray(Recipients) ? Recipients.join(',') : Recipients;
            recipientCsv = recipientCsv.split(',').map(id => id.trim()).join(',');

            const [result] = await con.execute(`
                INSERT INTO Notifications (Message, Type, Recipients, SeenBy, FileUrl, FileExtension)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [Message, Type, recipientCsv, '', FileUrl, FileExtension]);

            const notificationData = {
                ID: result.insertId,
                Message,
                Type,
                Recipients: recipientCsv,
                SeenBy: '',
                FileUrl,
                FileExtension,
                CreatedAt: new Date().toISOString()
            };

            if (global.io) {
                recipientCsv.split(',').forEach(userID => {
                    global.io.to(`user:${userID}`).emit('new-notification', notificationData);
                });
            }
            return notificationData;
        } catch (error) {
            console.error("[CommHelper] sendNotification failed:", error);
            throw error;
        }
    },

    async getNotifications(userID) {
        try {
            const [rows] = await con.execute(`
                SELECT * FROM Notifications 
                WHERE FIND_IN_SET(?, Recipients) > 0
                ORDER BY CreatedAt DESC
            `, [userID.toString()]);

            let unreadCount = 0;
            const notifications = rows.map(row => {
                const seenArray = row.SeenBy ? row.SeenBy.split(',') : [];
                const isUnread = !seenArray.includes(userID.toString());
                if (isUnread) unreadCount++;
                return { ...row, isUnread };
            });

            return { notifications, unreadCount };
        } catch (error) {
            console.error("[CommHelper] getNotifications failed:", error);
            throw error;
        }
    },

    async markAsSeen(notificationID, userID) {
        try {
            const [rows] = await con.execute(`SELECT SeenBy FROM Notifications WHERE ID = ?`, [notificationID]);
            if (rows.length === 0) return false;

            let seenArray = (rows[0].SeenBy || '').split(',').filter(x => x);
            if (!seenArray.includes(userID.toString())) {
                seenArray.push(userID.toString());
                await con.execute(`UPDATE Notifications SET SeenBy = ? WHERE ID = ?`, [seenArray.join(','), notificationID]);
            }
            return true;
        } catch (error) {
            console.error("[CommHelper] markAsSeen failed:", error);
            throw error;
        }
    }
};

module.exports = CommunicationHelper;
