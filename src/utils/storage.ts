export async function saveData(key: string, value: any): Promise<void> {
  try {
    // await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`Saving ${key}:`, value);
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

export async function getData(key: string): Promise<any> {
  try {
   
    console.log(`Getting ${key}`);
    return null;
  } catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    // await AsyncStorage.removeItem(key);
    console.log(`Removing ${key}`);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
}

export async function clearAll(): Promise<void> {
  try {
    // await AsyncStorage.clear();
    console.log('Clearing all storage');
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

