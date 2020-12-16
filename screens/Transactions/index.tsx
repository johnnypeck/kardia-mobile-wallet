/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View, Image} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ThemeContext} from '../../App';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import List from '../../components/List';
import TextInput from '../../components/TextInput';
import {truncate} from '../../utils/string';
import {styles} from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {getTxByAddress} from '../../services/transaction';
import {parseKaiBalance} from '../../utils/number';
import {format, formatDistanceToNowStrict, isSameDay} from 'date-fns';
import {addressBookAtom} from '../../atoms/addressBook';

const TransactionScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const [wallets] = useRecoilState(walletsAtom);
  const [selectedWallet] = useRecoilState(selectedWalletAtom);
  const [txList, setTxList] = useState([] as any[]);
  const [filterTx, setFilterTx] = useState('');
  const addressBook = useRecoilValue(addressBookAtom);

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      from: tx.from,
      to: tx.to,
      blockHash: tx.blockHash || '',
      blockNumber: tx.blockNumber || '',
      status: tx.status,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
          ? 'OUT'
          : 'IN',
    };
  };

  const getTX = () => {
    getTxByAddress(wallets[selectedWallet].address, 1, 30).then((newTxList) =>
      setTxList(newTxList.map(parseTXForList)),
    );
  };

  const filterTransaction = (tx: any) => {
    if (filterTx.length < 3) {
      return true;
    }
    if (
      tx.label.toUpperCase().includes(filterTx.toUpperCase()) ||
      tx.blockHash.toUpperCase().includes(filterTx.toUpperCase()) ||
      tx.blockNumber.includes(filterTx)
    ) {
      return true;
    }
    const posibleAddress = addressBook.filter((item) =>
      item.name.toUpperCase().includes(filterTx.toUpperCase()),
    );
    const existed = posibleAddress.find((item) => item.address === tx.from);
    if (existed) {
      return true;
    }
    return false;
  };

  const renderIcon = (status: number) => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: 50,
            height: 50,

            borderRadius: 25,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          {/* <IconM name={'attach-money'} size={30} color={'red'} /> */}
          <Image
            source={require('../../assets/logo.png')}
            style={styles.kaiLogo}
          />
        </View>
        {status ? (
          <AntIcon
            name="checkcircle"
            size={20}
            color={'green'}
            style={{position: 'absolute', right: -7, bottom: 0}}
          />
        ) : (
          <AntIcon
            name="closecircle"
            size={20}
            color={'red'}
            style={{position: 'absolute', right: -7, bottom: 0}}
          />
        )}
      </View>
    );
  };

  useEffect(() => {
    getTX();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>
          Transactions
        </Text>
      </View>
      <View style={styles.controlContainer}>
        <TextInput
          block={true}
          placeholder="Search with address / tx hash / block number / block hash..."
          value={filterTx}
          onChangeText={setFilterTx}
        />
      </View>
      <View style={{flex: 1, paddingHorizontal: 7}}>
        <List
          items={txList.filter(filterTransaction)}
          render={(item) => {
            return (
              <View style={[{padding: 15}]}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    navigation.navigate('Transaction', {
                      screen: 'TransactionDetail',
                      initial: false,
                      params: {txHash: item.label},
                    })
                  }>
                  {renderIcon(item.status)}
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 4,
                      paddingHorizontal: 14,
                    }}>
                    <Text style={{color: '#FFFFFF'}}>
                      {truncate(item.label, 8, 10)}
                    </Text>
                    <Text style={{color: 'gray'}}>
                      {/* {item.date.toLocaleString()} */}
                      {isSameDay(item.date, new Date())
                        ? `${formatDistanceToNowStrict(item.date)} ago`
                        : format(item.date, 'MMM d yyyy HH:mm')}
                    </Text>
                    {/* <Text style={{color: '#FFFFFF'}}>Success</Text> */}
                  </View>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}>
                    <Text
                      style={[
                        styles.kaiAmount,
                        item.type === 'IN'
                          ? {color: '#53B680'}
                          : {color: 'red'},
                      ]}>
                      {item.type === 'IN' ? '+' : '-'}
                      {parseKaiBalance(item.amount)} KAI
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          // header={
          //   <Text style={{ fontSize: 18, paddingHorizontal: 15, fontWeight: 'bold', color: '#FFFFFF' }}>Recent transactions</Text>
          // }
          onSelect={(itemIndex) => {
            Alert.alert(`${itemIndex}`);
          }}
          ListEmptyComponent={
            <Text style={[styles.noTXText, {color: theme.textColor}]}>
              No transaction
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default TransactionScreen;
