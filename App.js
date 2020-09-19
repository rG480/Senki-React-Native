import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper'
import axios from 'axios'
import * as SQLite from 'expo-sqlite'

import keys from './keys.json'

// Main app component. All of this is subject to change, as this is primarily to get the basic API connected.

let db = SQLite.openDatabase("senki");

export default class App extends React.Component {
  
  // State which contains input for the text box and data for the API
  state = {
    input_text: '',
    data: [],
    sqlite_db_content: ''
  }

  // Retrieves all API data based on a specific food input
  fetchApi() {
    axios.get(`https://api.edamam.com/api/food-database/v2/parser?app_id=${keys.edamam_app_id}&app_key=${keys.edamam_app_key}&ingr=${this.state.input_text}`)
    .then(api_data => {
      this.setState({
        data: api_data.data.hints
      });
    })
    .catch(err => {
      console.log(err);
    })
  }

  addToDatabase() {
    db.transaction(
      tx => {
        tx.executeSql(
          "INSERT INTO items (value) VALUES (?);", [this.state.input_text]
        );

        tx.executeSql(
          "SELECT * FROM items", [], (_, { rows }) => 
          this.setState({
            sqlite_db_content: JSON.stringify(rows)
          })
        )
      }
    )
  }

  resetTable(tableName) {
    db.transaction(
      tx => {
        tx.executeSql(
          `DELETE FROM ${tableName};`
        );
      }
    )
  }

  componentDidMount() {
    db.transaction(
      tx => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS items(id integer primary key not null, value varchar(255));"
        );

        tx.executeSql(
          "SELECT * FROM items", [], (_, { rows }) =>
          this.setState({
            sqlite_db_content: JSON.stringify(rows)
          })
        )
      }
    );
  }

  viewDatabase() {
    db.transaction(
      tx => {
        tx.executeSql(
          "SELECT * FROM items", [], (_, { rows }) =>
          this.setState({
            sqlite_db_content: JSON.stringify(rows)
          })
        )
      }
    )

    let parsedJSON = JSON.parse(this.state.sqlite_db_content)._array
    var text = ''

    for (let i = 0; i < parsedJSON.length; i++) {
        if (parsedJSON[i].value != undefined)
          text += parsedJSON[i].value + '\n'
    }

    alert(text)
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
          <Button style={styles.button} icon="database-plus" mode="contained" onPress={() => this.addToDatabase()}>Add</Button>
          <Button style={styles.button} icon="database-search" mode="contained" onPress={() => this.viewDatabase()}>View Database</Button>
          <Button style={styles.button} icon="database-search" mode="contained" onPress={() => this.resetTable("items")}>Delete All Items</Button>
          
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
