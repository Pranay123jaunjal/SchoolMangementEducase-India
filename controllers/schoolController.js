
const db = require("../config/db");
const haversine = require("haversine");
// Function to validate input fields
const isValidString = (value) => typeof value === "string" && value.trim().length > 0;
const isValidFloat = (value) => typeof value === "number" && !isNaN(value);
const isWithinRange = (lat, lon) => lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Required field validation
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "All fields (name, address, latitude, longitude) are required." });
  }

  // Type and format validation
  if (!isValidString(name)) {
    return res.status(400).json({ error: "Name must be a non-empty string." });
  }
  if (!isValidString(address)) {
    return res.status(400).json({ error: "Address must be a non-empty string." });
  }
  if (!isValidFloat(latitude) || !isValidFloat(longitude)) {
    return res.status(400).json({ error: "Latitude and longitude must be valid float numbers." });
  }
  if (!isWithinRange(latitude, longitude)) {
    return res.status(400).json({ error: "Latitude must be between -90 and 90, and longitude between -180 and 180." });
  }

  // Insert into database
  const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.status(201).json({
      message: "School added successfully!",
      school: { id: result.insertId, name, address, latitude, longitude },
    });
  });
};

exports.listSchools = (req, res) => {
    const { latitude, longitude } = req.body;
  
    // Required field validation
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }
  
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
  
    // Type and range validation
    if (!isValidFloat(userLat) || !isValidFloat(userLon)) {
      return res.status(400).json({ error: "Latitude and longitude must be valid float numbers." });
    }
    if (!isWithinRange(userLat, userLon)) {
      return res.status(400).json({ error: "Latitude must be between -90 and 90, and longitude between -180 and 180." });
    }
  
    // Fetch all schools from the database
    const query = "SELECT * FROM schools";
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err });
      }
  
      // Calculate distances using Haversine formula
      const schoolsWithDistance = results.map((school) => {
        const schoolLocation = { latitude: school.latitude, longitude: school.longitude };
        const userLocation = { latitude: userLat, longitude: userLon };
  
        return {
          ...school,
          distance: haversine(userLocation, schoolLocation, { unit: "km" }), // Distance in km
        };
      });
  
      // Sort schools by distance (nearest first)
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);
  
      res.status(200).json({
        message: "Schools sorted by proximity",
        schools: schoolsWithDistance,
      });
    });
  };