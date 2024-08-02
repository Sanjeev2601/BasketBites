'use client';

import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";

export default function Home() {
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }

      await updateInventory();
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateRecipe = () => {
    const ingredients = inventory.map(item => item.name).join(", ");

    axios
      .post("http://localhost:8080/chat", { prompt: `Generate a recipe using the following ingredients: ${ingredients}. Please format the response as follows:\nDish Name: <dish name>\nIngredients: <list of ingredients>\nRecipe: <recipe steps>` })
      .then((res) => {
        const formattedResponse = formatRecipeResponse(res.data.response);
        setResponse(formattedResponse);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError(err.response ? err.response.data.error : 'Unknown error');
      });
  };

  const formatRecipeResponse = (rawResponse) => {
    const dishNameMatch = rawResponse.match(/Dish Name:\s*(.*)/);
    const ingredientsMatch = rawResponse.match(/Ingredients:\s*(.*)/);
    const recipeMatch = rawResponse.match(/Recipe:\s*([\s\S]*)/);

    const dishName = dishNameMatch ? dishNameMatch[1] : "N/A";
    const ingredients = ingredientsMatch ? ingredientsMatch[1] : "N/A";
    const recipe = recipeMatch ? recipeMatch[1] : "N/A";

    return (
      <Box>
        <Typography variant="h6">Dish Name:</Typography>
        <Typography>{dishName}</Typography>
        <Typography variant="h6" mt={2}>Ingredients:</Typography>
        <Typography>{ingredients}</Typography>
        <Typography variant="h6" mt={2}>Recipe:</Typography>
        <Typography>{recipe.trim()}</Typography>
      </Box>
    );
  };

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      gap={2}
      sx={{ bgcolor: '#E6B0AA' }}
    >
      <Box
        position="fixed"
        top={0}
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#E6B0AA"
        zIndex={1}
        p={2}
      >
        <TextField
          variant="outlined"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '50%', backgroundColor: 'white' }} 
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ marginLeft: '20px' }} 
        >
          Add New Item
        </Button>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box display="flex" alignItems="center" width="100%" justifyContent="center" mt={10}>
        <Box border="1px solid #333" width="800px" maxHeight="400px" overflow="hidden">
          <Box
            height="100px"
            bgcolor="#ADD8E6"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            borderBottom="1px solid #000"
          >
            <Typography variant="h4" color="#333" sx={{ mt: 2 }}>Cart Items</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%" p={2} borderBottom="1px solid #000" bgcolor="#F5F5DC">
            <Typography variant="h6" color="#333" flex={1} textAlign="center" sx={{ borderRight: '1px solid #000' }}>Item Name</Typography>
            <Typography variant="h6" color="#333" flex={1} textAlign="center" sx={{ borderRight: '1px solid #000' }}>Quantity</Typography>
            <Typography variant="h6" color="#333" flex={1} textAlign="center">Add/Remove</Typography>
          </Box>
          <Box sx={{ maxHeight: '240px', overflowY: 'auto' }}> {}
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#f0f0f0"
                padding={2}
                borderBottom="1px solid #333" // Add border bottom
                sx={{
                  '& > div': {
                    borderRight: '1px solid #000',
                    flex: 1,
                    textAlign: 'center',
                  },
                  '& > div:last-child': {
                    borderRight: 'none',
                  },
                }}
              >
                <Box>{name.charAt(0).toUpperCase() + name.slice(1)}</Box>
                <Box>{quantity}</Box>
                <Box>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: 'lightgreen', color: '#000' }} 
                      onClick={() => {
                        addItem(name);
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: 'lightcoral', color: '#000' }} 
                      onClick={() => {
                        removeItem(name);
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={2}
        width="100%"
        maxWidth="800px"
        gap={2}
      >
        <Button
          variant="contained"
          onClick={generateRecipe}
        >
          Generate Recipe
        </Button>
        {response && (
          <Box mt={2} p={2} border="1px solid #ccc" borderRadius="8px" bgcolor="#f8d7da">
            {response}
          </Box>
        )}
        {error && (
          <Box mt={2} p={2} border="1px solid #f00" borderRadius="8px" bgcolor="#f8d7da">
            <Typography variant="h6" color="error">Error:</Typography>
            <Typography>{error}</Typography>
          </Box>
        )}
      </Box>

      <Box 
        width="100%"
        bgcolor="#f0f0f0"
        py={2}
        borderTop="1px solid #ccc"
        display="flex"
        justifyContent="center"
        mt="auto"
      >
        <Typography variant="body1">
          Sanjeev @ Headstarter Week 2 Project
        </Typography>
      </Box>
    </Box>
  );
}
