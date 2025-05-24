import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Container, Heading, Text, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import axios from 'axios';

// Use relative path for API requests (handled by proxy in development)
const API_URL = '/api';

function App() {
  const [health, setHealth] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Check API health on component mount
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/health`);
        setHealth(response.data);
      } catch (error) {
        console.error('Error checking API health:', error);
        toast({
          title: 'Error',
          description: 'Failed to connect to the API server',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    checkHealth();
  }, [toast]);

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" p={4}>
        <Container maxW="container.lg" py={8}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" py={10}>
              <Heading as="h1" size="2xl" mb={4} color="blue.600">
                Library Reservation System
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Manage your library resources efficiently
              </Text>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg" mb={4}>
                  API Status
                </Heading>
                
                {health ? (
                  <HStack spacing={4}>
                    <Box 
                      w="12px" 
                      h="12px" 
                      borderRadius="full" 
                      bg={health.status === 'ok' ? 'green.500' : 'red.500'}
                    />
                    <Text>
                      API is {health.status === 'ok' ? 'running' : 'down'}
                    </Text>
                  </HStack>
                ) : (
                  <Text>Checking API status...</Text>
                )}

                <Box mt={8}>
                  <Text mb={4}>
                    Welcome to the Library Reservation System. Please sign in to continue.
                  </Text>
                  <HStack spacing={4}>
                    <Button colorScheme="blue">Sign In</Button>
                    <Button variant="outline">Register</Button>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            <Box mt={8} textAlign="center" color="gray.500">
              <Text>Library Reservation System &copy; {new Date().getFullYear()}</Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
