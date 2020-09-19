import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper'
import axios from 'axios'

import keys from './keys.json'

// Main app component. All of this is subject to change, as this is primarily to get the basic API connected.

export default class App extends React.Component {
  
  // State which contains input for the text box and data for the API
  state = {
    input_text: '',
    data: []
  }

  // Retrieves all API data based on a specific food input
  fetchApi() {
    axios.get(`https://api.edamam.com/api/food-database/v2/parser?app_id=${keys.edamam_app_id}&app_key=${keys.edamam_app_key}&ingr=${this.state.input_text}`)
    .then(api_data => {
      this.setState({
        data: api_data.data.hints
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  render() {
    return (
      <PaperProvider>
        <View style={styles.container}>
        
          <TextInput 
            label="Enter In An Ingrediant"
            value={this.state.input_text}
            onChangeText={text => this.setState({input_text: text})}
          />

          <Button style={styles.button} icon="check-underline" mode="contained" onPress={() => this.fetchApi()}>Go</Button>
          
          {
            this.state.data.map(item => (
              <Text>{item.food.label}</Text>
            ))
          }

          <StatusBar style="auto" />
        </View>
      </PaperProvider>

    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 50,
    marginTop: 30
  }
});
