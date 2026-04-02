const prisma = require('../infrastructure/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            // Check if user exists
            const existingUser = await prisma.voter.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.voter.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json({ success: true, user: userWithoutPassword });
        } catch (error) {
            console.error("Auth Controller Error:", error.message);
            res.status(500).json({ success: false, message: `System error: ${error.message}` });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await prisma.voter.findUnique({ where: { email } });
            if (!user || !user.password) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Create Token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

            const { password: _, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword, token });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();
