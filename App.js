import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Image, FlatList } from 'react-native';
import store from 'react-native-simple-store';
import { FormLabel, FormInput } from 'react-native-elements'
const request = require('superagent');
const _ = require('lodash');

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this)
    this.state = {
      coins: [],
      refreshing: false
    }
  }

  _onPressButton() {
    Alert.alert('Pentakill!')
  }

  _onChangeText(){
    console.log('>>>>', arguments)
  }

  refreshCoins(){
    request.get('https://min-api.cryptocompare.com/data/all/coinlist')
    .end((err, res) => {
      var coinsArrayAll = _.values(res.body.Data)
      coinsArrayAll.sort(function (a, b) {
        return parseFloat(a.SortOrder) - parseFloat(b.SortOrder);
      });
      var coinsArray = coinsArrayAll.slice(0, 11)

      var queryString = coinsArray.map(coin => {
        return coin.Symbol
      }).join()

      request.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${queryString}&tsyms=USD`)
        .end((err, res) => {
          console.log('>>> res', res)
          for (var i = 0; i < coinsArray.length; i++) {
            coinsArray[i].price = res.body[coinsArray[i].Symbol]['USD']
          }
          this.setState({
            coins: coinsArray,
            refreshing: false
          })
        })
    })
  }

  componentWillMount(){
    this.refreshCoins();
  }

  _renderRows({item}) {
    return (
      <View key={item.Id} style={styles.row}>
        <Image source={{ uri: `https://www.cryptocompare.com${item.ImageUrl}`}}
          style={{ width: 50, height: 50}} />
        <Text style={{paddingLeft: 15}}>{item.FullName}, ${item.price}</Text>
      </View>

    )
  }

  _keyExtractor(item, index){
    return item.Id;
  }

  handleRefresh(){
    this.setState({
      refreshing: true
    }, () => {
      this.refreshCoins();
    })
    
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.coins}
          renderItem={this._renderRows}
          keyExtractor={this._keyExtractor}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50
  },
  row: { 
    flexDirection: 'row' ,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10
  }
});
