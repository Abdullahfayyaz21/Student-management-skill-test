const asyncHandler = require("express-async-handler");
const { 
    getAllStudents, 
    addNewStudent, 
    getStudentDetail, 
    setStudentStatus, 
    updateStudent, 
    deleteStudent 
} = require("./students-service");

// ✅ GET all students
const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { class_id, section_id, search } = req.query;
    const students = await getAllStudents({ class_id, section_id, search });
    
    res.status(200).json({ 
        success: true, 
        data: students,
        count: students.length 
    });
});

// ✅ GET single student
const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(id);
    
    if (!student) {
        res.status(404);
        throw new Error("Student not found");
    }
    
    res.status(200).json({ 
        success: true, 
        data: student 
    });
});

// ✅ CREATE student - Robust field mapping
const handleAddStudent = asyncHandler(async (req, res) => {
    // Debug logging (remove in production)
    console.log("📥 Frontend Payload:", JSON.stringify(req.body, null, 2));

    // Map frontend field names to database field names with fallbacks
    const payload = {
        user_id: req.body.user_id || 1, // Default to admin user
        
        // Handle class: accept numeric ID or parse from "Class 1" → 1
        class_id: req.body.class_id || req.body.classId || 
                  (typeof req.body.class === 'string' ? parseInt(req.body.class.replace(/\D/g,'')) : req.body.class) || 1,
        
        // Handle section: accept numeric ID or map "Section A" → 1, "Section B" → 2
        section_id: req.body.section_id || req.body.sectionId ||
                    (typeof req.body.section === 'string' 
                        ? (req.body.section.toLowerCase().includes('a') ? 1 : 2) 
                        : req.body.section) || 1,
        
        // Handle roll: map 'roll' → 'roll_number'
        roll_number: req.body.roll_number || req.body.rollNumber || req.body.roll,
        
        // Handle phone fields
        parent_phone: req.body.parent_phone || req.body.phone || req.body.fatherPhone,
        
        // Handle address fields
        address: req.body.address || req.body.currentAddress,
        
        // Handle date
        admission_date: req.body.admission_date || new Date()
    };

    console.log("🔄 Mapped Payload:", JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.class_id || !payload.roll_number) {
        return res.status(400).json({ 
            success: false,
            error: "Missing required fields", 
            message: "class_id and roll_number are required",
            received: req.body,
            mapped: payload 
        });
    }

    try {
        const newStudent = await addNewStudent(payload);
        
        return res.status(201).json({ 
            success: true, 
            message: "Student created successfully", 
            data: newStudent 
        });
    } catch (err) {
        // Handle duplicate roll number
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                error: "Duplicate entry",
                message: `Roll number '${payload.roll_number}' already exists`
            });
        }
        // Handle foreign key constraint
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                error: "Invalid reference",
                message: "Referenced class, section, or user does not exist"
            });
        }
        // Generic error
        throw err;
    }
});

// ✅ UPDATE student
const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const updatedStudent = await updateStudent(id, req.body);
    
    if (!updatedStudent) {
        res.status(404);
        throw new Error("Student not found");
    }
    
    res.status(200).json({ 
        success: true, 
        message: "Student updated successfully", 
        data: updatedStudent 
    });
});

// ✅ UPDATE student status
const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !["active", "inactive"].includes(status)) {
        res.status(400);
        throw new Error("Invalid status. Must be 'active' or 'inactive'");
    }
    
    const result = await setStudentStatus(id, status);
    
    if (!result) {
        res.status(404);
        throw new Error("Student not found");
    }
    
    res.status(200).json({ 
        success: true, 
        message: `Student marked as ${status}`, 
        data: result 
    });
});

// ✅ DELETE student
const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await deleteStudent(id);
    
    res.status(200).json({ 
        success: true, 
        message: "Student deleted successfully" 
    });
});

// ✅ EXPORTS
module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};