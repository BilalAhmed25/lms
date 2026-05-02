var express = require('express'),
    router = express.Router()
    ;

const { con } = require('../database');
const authenticateToken = require('../authenticateToken');

router.use(authenticateToken);

// Get all roles (School-specific + System roles)
router.get('/', async function (req, res) {
    try {
        let query = 'SELECT * FROM Roles WHERE SchoolID = ? ORDER BY IsSystem DESC, Name ASC';
        let params = [req.user.SchoolID];



        const [rows] = await con.execute(query, params);
        // Ensure Access is parsed as JSON if it comes as a string from DB (depending on MySQL driver/version)
        const roles = rows.map(r => ({
            ...r,
            Access: typeof r.Access === 'string' ? JSON.parse(r.Access) : (r.Access || [])
        }));
        res.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json('Failed to fetch roles');
    }
});

// Create new role
router.post('/', async function (req, res) {
    try {
        const { name, access } = req.body;
        if (!name) return res.status(400).json('Role Name is required');

        await con.execute(
            'INSERT INTO Roles (SchoolID, Name, Access, IsSystem) VALUES (?, ?, ?, false)',
            [req.user.SchoolID, name, JSON.stringify(access || [])]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json('Failed to create role');
    }
});

// Update role
router.put('/:id', async function (req, res) {
    const { name, access } = req.body;
    try {
        const [role] = await con.execute('SELECT * FROM Roles WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        
        if (role.length === 0) return res.status(404).json('Role not found');
        if (role[0].IsSystem) return res.status(403).json('System roles cannot be modified');

        await con.execute(
            'UPDATE Roles SET Name = ?, Access = ? WHERE ID = ?', 
            [name || role[0].Name, JSON.stringify(access || []), req.params.id]
        );

        res.json('Success');
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json('Failed to update role');
    }
});

// Delete role
router.delete('/:id', async function (req, res) {
    try {
        const [role] = await con.execute('SELECT * FROM Roles WHERE ID = ? AND SchoolID = ?', [req.params.id, req.user.SchoolID]);
        
        if (role.length === 0) return res.status(404).json('Role not found');
        if (role[0].IsSystem) return res.status(403).json('System roles cannot be deleted');

        // Check if any users are using this role
        const [users] = await con.execute('SELECT ID FROM Users WHERE RoleID = ? LIMIT 1', [req.params.id]);
        if (users.length > 0) return res.status(400).json('Cannot delete role while users are assigned to it');

        await con.execute('DELETE FROM Roles WHERE ID = ?', [req.params.id]);
        res.json('Success');
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json('Failed to delete role');
    }
});

module.exports = router;
