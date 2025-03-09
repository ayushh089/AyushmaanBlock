const Client = require("../config/dbConn.js");
const responseCode = require("../config/responseCode.js");
const { config } = require("dotenv");
config();

const registrationHandler = async (req, res) => {
  try {
    const payload = req.body.offChainData;
    console.log("Payload:", payload);
    

    if (!payload || !payload.wallet_address || !payload.name || !payload.role || !payload.date_of_birth ) {
      return res
        .status(responseCode.badRequest)
        .json({ msg: "Missing required fields" });
    }

    // Validate Role
    const validRoles = ["patient", "doctor", "admin", "pharmacist"];
    if (!validRoles.includes(payload.role)) {
      return res.status(responseCode.badRequest).json({ msg: "Invalid role" });
    }

    // Check if wallet address already exists
    const existingUser = await Client.query(
      "SELECT * FROM users WHERE wallet_address = $1",
      [payload.wallet_address]
    );
    if (existingUser.rowCount > 0) {
      return res
        .status(responseCode.conflict)
        .json({ msg: "Wallet address already registered" });
    }

    // Insert User
    const query = `
            INSERT INTO users (wallet_address, name, email, phone, role, date_of_birth, gender) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id;
        `;

    const values = [
      payload.wallet_address,
      payload.name,
      payload.email || null,
      payload.phone || null,
      payload.role,
      payload.date_of_birth || null,
      payload.gender || null,
    ];

    const newUser = await Client.query(query, values);
console.log("Hey",newUser);

    return res.status(responseCode.created).json({
      msg: "User registered successfully",
      user_id: newUser.rows[0].id,
    });
  } catch (err) {
    console.error("@registrationHandler : \n", err);
    return res
      .status(responseCode.internalServerError)
      .json({ msg: err.message });
  }
};

module.exports = { registrationHandler };
