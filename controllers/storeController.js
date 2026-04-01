const Store = require('../models/Store');

// @desc    Create a new store
// @route   POST /api/stores
// @access  Public
const createStore = async (req, res) => {
  try {
    const { name, address, phone, openingTime, closingTime } = req.body;

    const newStore = new Store({
      name,
      address,
      phone,
      openingTime,
      closingTime
    });

    const savedStore = await newStore.save();
    res.status(201).json(savedStore);
  } catch (error) {
    res.status(500).json({ message: 'Error creating store', error: error.message });
  }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores', error: error.message });
  }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
const getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store', error: error.message });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Public
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedStore = await Store.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: 'Error updating store', error: error.message });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Public
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedStore = await Store.findByIdAndDelete(id);

    if (!deletedStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.status(200).json({ message: 'Store deleted successfully', deletedStore });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store', error: error.message });
  }
};

module.exports = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore
};
