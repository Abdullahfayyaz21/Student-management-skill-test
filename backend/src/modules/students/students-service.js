const { db } = require("../../config/db");

// ✅ GET all students - Safe query with only existing columns
const getAllStudents = async ({ class_id, section_id, search } = {}) => {
    let query = `
        SELECT 
            s.id,
            s.user_id,
            s.class_id,
            s.section_id,
            s.roll_number,
            s.parent_phone,
            s.address,
            s.admission_date,
            s.status,
            s.created_at,
            s.updated_at,
            u.name as user_name,
            u.email as user_email,
            c.name as class_name,
            sec.name as section_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (class_id) {
        query += ` AND s.class_id = $${paramCount++}`;
        params.push(class_id);
    }
    if (section_id) {
        query += ` AND s.section_id = $${paramCount++}`;
        params.push(section_id);
    }
    if (search) {
        query += ` AND (u.name ILIKE $${paramCount} OR s.roll_number ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
    }

    query += " ORDER BY s.created_at DESC";
    
    const result = await db.query(query, params);
    return result.rows;
};

// ✅ CREATE new student - Only insert columns that exist
const addNewStudent = async (studentData) => {
    const { 
        user_id, 
        class_id, 
        section_id, 
        roll_number, 
        parent_phone, 
        address, 
        admission_date 
    } = studentData;

    const result = await db.query(
        `INSERT INTO students (
            user_id, 
            class_id, 
            section_id, 
            roll_number, 
            parent_phone, 
            address, 
            admission_date,
            created_at, 
            updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, roll_number, parent_phone, address, admission_date, status, created_at`,
        [
            user_id, 
            class_id, 
            section_id, 
            roll_number, 
            parent_phone, 
            address, 
            admission_date || new Date()
        ]
    );
    
    return result.rows[0];
};

// ✅ GET single student by ID
const getStudentDetail = async (id) => {
    const result = await db.query(
        `SELECT 
            s.id,
            s.user_id,
            s.class_id,
            s.section_id,
            s.roll_number,
            s.parent_phone,
            s.address,
            s.admission_date,
            s.status,
            s.created_at,
            s.updated_at,
            u.name as user_name,
            u.email as user_email,
            c.name as class_name,
            sec.name as section_name
         FROM students s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN classes c ON s.class_id = c.id
         LEFT JOIN sections sec ON s.section_id = sec.id
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

// ✅ UPDATE student - Safe dynamic updates
const updateStudent = async (id, updateData) => {
    const { class_id, section_id, roll_number, parent_phone, address } = updateData;
    
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (class_id !== undefined && class_id !== null) { 
        updates.push(`class_id = $${paramCount++}`); 
        values.push(class_id); 
    }
    if (section_id !== undefined && section_id !== null) { 
        updates.push(`section_id = $${paramCount++}`); 
        values.push(section_id); 
    }
    if (roll_number !== undefined && roll_number !== null) { 
        updates.push(`roll_number = $${paramCount++}`); 
        values.push(roll_number); 
    }
    if (parent_phone !== undefined && parent_phone !== null) { 
        updates.push(`parent_phone = $${paramCount++}`); 
        values.push(parent_phone); 
    }
    if (address !== undefined && address !== null) { 
        updates.push(`address = $${paramCount++}`); 
        values.push(address); 
    }

    if (updates.length === 0) return await getStudentDetail(id);

    values.push(id);
    const query = `UPDATE students SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, roll_number, parent_phone, address, updated_at`;
    const result = await db.query(query, values);
    return result.rows[0];
};

// ✅ UPDATE student status
const setStudentStatus = async (id, status) => {
    const result = await db.query(
        "UPDATE students SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status",
        [status, id]
    );
    return result.rows[0] || null;
};

//DELETE student
const deleteStudent = async (id) => {
    await db.query("DELETE FROM students WHERE id = $1", [id]);
    return true;
};

module.exports = {
    getAllStudents,
    addNewStudent,
    getStudentDetail,
    updateStudent,
    setStudentStatus,
    deleteStudent,
};