const Medicine = require('../models/Medicine');
const Store = require('../models/Store');

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Public
const addMedicine = async (req, res) => {
  try {
    const { name, price, quantity, expiry, manufactureDate, composition, storeId } = req.body;

    // Validate that storeId exists if it is provided
    if (storeId) {
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        return res.status(404).json({ message: 'Store not found' });
      }
    }

    // Calculate status based on quantity
    const status = Number(quantity) === 0 ? 'Out of Stock' : 'Available';

    const newMedicine = new Medicine({
      name,
      price,
      quantity,
      expiry,
      manufactureDate,
      composition,
      storeId,
      status
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error: error.message });
  }
};

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getAllMedicines = async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = storeId ? { storeId: storeId } : {};
    
    // Populate storeId to include store details
    const medicines = await Medicine.find(filter).populate('storeId');
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error.message });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getSingleMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('storeId');
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicine', error: error.message });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Public
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Recalculate status if quantity is part of the update request
    if (updateData.quantity !== undefined) {
      updateData.status = Number(updateData.quantity) === 0 ? 'Out of Stock' : 'Available';
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('storeId');

    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating medicine', error: error.message });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Public
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine deleted successfully', deletedMedicine });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medicine', error: error.message });
  }
};

// @desc    Search medicines by name with "Did you mean?" feature
// @route   GET /api/medicines/search?q=query
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    const medicines = await Medicine.find({ name: regex }).populate('storeId');

    if (medicines.length === 0) {
      // Basic "Did you mean?": matching partial characters softly
      const fallbackRegex = new RegExp(q.split('').join('.*'), 'i');
      const closestMatches = await Medicine.find({ name: fallbackRegex })
        .select('name -_id')
        .limit(3);
        
      let suggestions = closestMatches.map(m => m.name);
      
      if (suggestions.length === 0 && q.length >= 2) {
        const charMatches = await Medicine.find({ name: new RegExp('^' + q.slice(0, 2), 'i') })
          .select('name -_id')
          .limit(3);
        suggestions = charMatches.map(m => m.name);
      }
      
      const response = { message: "No medicines found" };
      if (suggestions.length > 0) {
        response.didYouMean = suggestions;
      }
      
      return res.status(200).json(response);
    }

    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error searching medicines', error: error.message });
  }
};

// @desc    Get autocomplete suggestions for medicines
// @route   GET /api/medicines/suggestions?q=query
// @access  Public
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json([]);
    }

    const regex = new RegExp(q, 'i');
    const suggestions = await Medicine.find({ name: regex })
      .select('name -_id')
      .sort({ name: 1 })
      .limit(5);

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
};

// @desc    Get trending medicines
// @route   GET /api/medicines/trending
// @access  Public
const getTrendingMedicines = async (req, res) => {
  try {
    // Trending based on highest quantity or latest added
    const trending = await Medicine.find()
      .sort({ quantity: -1, createdAt: -1 })
      .limit(10)
      .populate('storeId');

    res.status(200).json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending medicines', error: error.message });
  }
};

// @desc    Checkout medicines (decrement quantity)
// @route   POST /api/medicines/checkout
// @access  Public
const checkoutMedicines = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, quantity }
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items array' });
    }

    // Step 1: Validate stock for ALL items first
    for (const item of items) {
      const med = await Medicine.findById(item.id);
      if (!med) {
        return res.status(404).json({ message: `Medicine with ID ${item.id} not found` });
      }
      if (med.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${med.name}. Available: ${med.quantity}, Requested: ${item.quantity}` 
        });
      }
    }

    // Step 2: If all valid, process the updates
    const updatePromises = items.map(async (item) => {
      const med = await Medicine.findById(item.id);
      med.quantity = med.quantity - item.quantity;
      med.status = med.quantity === 0 ? 'Out of Stock' : 'Available';
      return med.save();
    });

    await Promise.all(updatePromises);
    res.status(200).json({ message: 'Checkout successful and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
};

module.exports = {
  addMedicine,
  getAllMedicines,
  getSingleMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getSuggestions,
  getTrendingMedicines,
  checkoutMedicines
};
