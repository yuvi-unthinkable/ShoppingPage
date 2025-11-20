import {
  Alert,
  Button,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import { addProfileRecord } from '../database/profileService';
import { UserContext } from '../context/UserContext';
import { Cross } from 'lucide-react-native';

const fieldTypes = [
  { label: 'Text Input', value: 'text-input' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date Picker', value: 'datePicker' },
];

const height = [
  { label: '1FT', value: 1 },
  { label: '2FT', value: 2 },
  { label: '3FT', value: 3 },
  { label: '4FT', value: 4 },
  { label: '5FT', value: 5 },
  { label: '6FT', value: 6 },
  { label: '7FT', value: 7 },
  { label: '8FT', value: 8 },
];
const intrestsCategories = [
  { label: 'Cricket', value: 'Cricket' },
  { label: 'Hockey', value: 'Hockey' },
  { label: 'Football', value: 'Football' },
  { label: 'Chess', value: 'Chess' },
  { label: 'Carrom', value: 'Carrom' },
  { label: 'Badminton', value: 'Badminton' },
];
const genderCategories = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

export default function ProfileForm() {
  const [fieldType, setFieldType] = useState('');
  const [textFieldType, setTextFieldType] = useState('');
  const [dropdownFieldType, setDropdownFieldType] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [label, setLabel] = useState('');
  const [isShowAddField, setIsShowAddField] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);

  // usesates for the data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [userHeight, setUserHeight] = useState(0);
  const [intrests, setIntrests] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [gender, setGender] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [showFormData, setShowFormData] = useState(false);

  const [textInputTypes, setTextInputTypes] = useState([
    { label: 'Name', value: 'Name' },
    { label: 'Phone', value: 'Phone' },
    { label: 'Email', value: 'Email' },
    { label: 'Address', value: 'Address' },
    { label: 'Text Area', value: 'textArea' },
  ]);

  const [dropdownInputTypes, setDropdownInputTypes] = useState([
    { label: 'Height', value: 'height' },
    { label: 'Gender', value: 'gender' },
    { label: 'Intrests', value: 'intrests' },
  ]);

  const renderLabel = () => {
    if (fieldType || isFocus) {
      return (
        <Text style={[styles.sectionTitle, isFocus && { color: 'blue' }]}>
          Dropdown label are here
        </Text>
      );
    }
    return null;
  };

  const fields = useMemo(
    () => [
      {
        type: 'text-input',
        data: {
          inputType: 'Label',
          minLength: 3,
          maxLength: 50,
          required: true,
          value: label,
          placeholder: 'Enter label',
          onChange: setLabel,
          error: '',
        },
      },
      {
        type: 'text-input',
        data: {
          inputType: 'Name',
          minLength: 6,
          maxLength: 50,
          required: true,
          value: name,
          placeholder: 'Enter your name',
          onChange: setName,
          error: '',
        },
      },
      {
        type: 'text-input',
        data: {
          inputType: 'Email',
          minLength: 6,
          maxLength: 255,
          required: true,
          value: email,
          placeholder: 'Enter your email',
          onChange: setEmail,
          rule: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          error: '',
        },
      },
      {
        type: 'text-input',
        data: {
          inputType: 'Phone',
          minLength: 10,
          maxLength: 10,
          required: true,
          value: phone,
          placeholder: 'Enter phone number',
          onChange: setPhone,
          rule: (value: string) => /^[0-9]{10}$/.test(value),
          error: '',
        },
      },
      {
        type: 'text-input',
        data: {
          inputType: 'Address',
          minLength: 1,
          maxLength: 255,
          required: false,
          value: address,
          placeholder: 'Enter address',
          onChange: setAddress,
          error: '',
        },
      },
      {
        type: 'text-input',
        data: {
          inputType: 'textArea',
          minLength: 0,
          maxLength: 500,
          required: false,
          value: additionalInfo,
          placeholder: 'Enter details...',
          onChange: setAdditionalInfo,
          error: '',
        },
      },
      {
        type: 'dropdown',
        data: {
          inputType: 'height',
          data: height,
          required: true,
          value: userHeight,
          placeholder: 'Select height',
          onChange: setUserHeight,
          rule: (value: number) => value >= 1 && value <= 8,
          error: '',
        },
      },
      {
        type: 'dropdown',
        data: {
          inputType: 'gender',
          data: genderCategories,
          required: false,
          value: gender,
          placeholder: 'Select gender',
          onChange: setGender,
          error: '',
        },
      },
      {
        type: 'dropdown',
        data: {
          inputType: 'intrests',
          data: intrestsCategories,
          required: false,
          value: intrests,
          placeholder: 'Select interests',
          onChange: setIntrests,
          error: '',
        },
      },
      {
        type: 'datePicker',
        data: {
          required: false,
          value: date,
          placeholder: 'Select birth date',
          onChange: setDate,
          rule: (value: any) => {
            const today = new Date();
            let age = today.getFullYear() - value.getFullYear();
            const md = today.getMonth() - value.getMonth();
            if (md < 0 || (md === 0 && today.getDate() < value.getDate())) {
              age--;
            }
            return age >= 10;
          },
          error: '',
        },
      },
    ],
    [
      label,
      name,
      email,
      phone,
      address,
      additionalInfo,
      userHeight,
      gender,
      intrests,
      date,
    ],
  );
  useEffect(() => {
    btnAvailable()
//     let isValid = true;
//     const updatedFieldsState = [...fieldsState];

//     fieldsState.forEach(item => {
//       const err = validateField(item);
//       if (err) {
//         isValid = false;
//       }

//       updatedFieldsState.forEach(f => {
//         if (f.data.label === item.data.label) {
//           f.data.error = err;
//         }
//       });
//     });

//     setFieldsState(updatedFieldsState);
  }, [name, email, label, userHeight, phone]);

  const validateField = (field: any) => {
    const v = field?.data?.value;
    const rule = field?.data?.rule;

    if (!field?.data?.required && !v) {
      return '';
    }

    // Required check
    if (field?.data?.required && !v) {
      setFormValid(false);
      return `${field.data.label} is required`;
    }

    // Min length check
    if (field?.data?.minLength && v.length < field?.data?.minLength) {
      setFormValid(false);
      return `${field.data.label} must be at least ${field.data.minLength} characters`;
    }

    // Max length check
    if (field?.data?.maxLength && v.length > field?.data?.maxLength) {
      setFormValid(false);
      return `${field.data.label} must be less than ${field.data.maxLength} characters`;
    }

    // Custom rule check
    if (rule && !rule(v)) {
      setFormValid(false);
      return `${field.data.label} is invalid`;
    }

    setFormValid(true);

    return ''; // Return empty string if no error
  };

  const [fieldsState, setFieldsState] = useState<any[]>([]);

  const handleAddSection = (
    fieldType: string,
    inputTypes?: string,
    label?: string,
  ) => {
    if (fieldType === 'date') {
      const newArr = fields
        .filter(item => item.type === fieldType)
        .map(item => ({
          ...item,

          data: {
            ...item.data,
            label: label, // update the label
          },
        }));

      setFieldsState(prev => [...prev, ...newArr]);
    }
    // if (fieldType !== 'text-input') return;

    const newArr = fields
      .filter(
        item => item.type === fieldType && item.data.inputType === inputTypes,
      )
      .map(item => ({
        ...item,

        data: {
          ...item.data,
          label: label, // update the label
        },
      }));

    setFieldsState(prev => [...prev, ...newArr]);

    // return newArr;
  };

  const addingInputFields = (fieldType: string) => {
    const [label, setLabel] = useState('');
    if (!isShowAddField) return null;

    return (
      <>
        {fieldType === 'text-input' && (
          <>
            <View style={[styles.row, { gap: 10, marginVertical: 10 }]}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={textInputTypes}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select item' : '...'}
                searchPlaceholder="Search..."
                value={textFieldType}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setTextFieldType(item.value);
                  setIsFocus(false);
                }}
              />
              <TextInput
                value={label}
                placeholder="label"
                style={styles.input}
                onChangeText={setLabel}
              />
            </View>

            <Button
              title="Add"
              onPress={() => {
                const labelExists = fieldsState.some(
                  item => item.data.label === label,
                );
                if (labelExists) {
                  Alert.alert('Warning', 'Label already exists');
                  return;
                }

                setTextInputTypes(prev =>
                  prev.filter(item => item.value !== textFieldType),
                );

                handleAddSection(fieldType, textFieldType, label);
                setLabel('');
                setIsShowAddField(false);
                setShowFormData(true);
              }}
            />
          </>
        )}
        {fieldType === 'dropdown' && (
          <>
            <View style={[styles.row, { gap: 10, marginVertical: 10 }]}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={dropdownInputTypes}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select item' : '...'}
                searchPlaceholder="Search..."
                value={dropdownFieldType}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setDropdownFieldType(item.value);
                  setIsFocus(false);
                }}
              />
              <TextInput
                value={label}
                placeholder="label"
                style={styles.input}
                onChangeText={setLabel}
              />
            </View>

            <Button
              title="Add"
              onPress={() => {
                const exists = fieldsState.some(
                  item => item.data.label === label,
                );

                if (exists) {
                  Alert.alert('Warning', 'Label already exists');
                  return;
                }

                setDropdownInputTypes(prev =>
                  prev.filter(item => item.value !== dropdownFieldType),
                );

                handleAddSection(fieldType, dropdownFieldType, label);
                setLabel('');
                setIsShowAddField(false);
                setShowFormData(true);
              }}
            />
          </>
        )}
        {fieldType === 'datePicker' && (
          <View style={{ marginVertical: 10 }}>
            <Button
              title="Add"
              onPress={() => {
                const exists = fieldsState.some(
                  item => item.type === fieldType,
                );

                if (exists) {
                  Alert.alert('Warning', 'Label already exists');
                  return;
                }

                handleAddSection(fieldType);
                setIsShowAddField(false);
                setShowFormData(true);
              }}
            />
          </View>
        )}
      </>
    );
  };

  const handleSubmit = async () => {
    const payload = {
      userId: user?.id,
      label: name,
      name,
      phone,
      email,
      height: userHeight,
      address,
      additionalText: additionalInfo,
      intrests,
      dob: date,
    };

    try {
      const result = await addProfileRecord(payload as any);
      console.log('🚀 ~ handleSubmit ~ result:', result);
      console.log('Profile added:', result);

      if (result)
        Alert.alert('Sucess', 'your information has been saved sucessfuly');
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert('Error', 'your data cannot be saved');
    }
  };
   
const btnAvailable = () => {
  const invalid = fields.some(el => {
    if (!el.data.required) return false;

    const value = el.data.value;
    return value === '' || value === 0 || value == null;
  });

  return !invalid;
};

  const formData = () => {
    console.log('🚀 ~ formData ~ showFormData:', showFormData);
    if (!showFormData) return null;
    return (
      <View style={{ marginVertical: 10 }}>
        <FlatList
          data={fieldsState}
          renderItem={({ item, index }) => {
            return (
              <View>
                {item.type === 'text-input' && (
                  <View style={styles.row}>
                    <Text style={styles.labelText}>{item.data?.label} </Text>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        value={item.data.value}
                        placeholder={item.data.placeholder}
                        maxLength={item.data.maxLength}
                        multiline={item.data?.inputType === 'textArea'}
                        onBlur={()=>validateField(item)}
                        onChangeText={text => {
                          setFieldsState(prev =>
                            prev.map(f =>
                              f.data.label === item.data.label
                                ? { ...f, data: { ...f.data, value: text } }
                                : f,
                            ),
                          );
                          
                          
                          item.data.onChange(text);

                          const err = validateField({
                            ...item,
                            data: { ...item.data, value: text },
                          });
                          setFieldsState(prev =>
                            prev.map(f =>
                              f.data.label === item.data.label
                                ? { ...f, data: { ...f.data, error: err } }
                                : f,
                            ),
                          );
                        }}
                        style={[
                          {
                            height:
                              item.data?.inputType === 'textArea'
                                ? 100
                                : 'auto',
                          },
                          styles.input,
                          item.data.error && {
                            borderColor: 'red',
                            borderWidth: 1,
                          },
                        ]}
                      />

                      {item.data.error ? (
                        <Text style={{ flex: 1, color: 'red' }}>
                          {item.data.error}
                        </Text>
                      ) : null}
                    </View>
                    {!item.data?.required && (
                      <View
                        style={{
                          transform: [{ rotate: '45deg' }],
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            const removedType = item.data.inputType;

                            setFieldsState(prev =>
                              prev.filter(
                                f => f.data.inputType !== removedType,
                              ),
                            );

                            setTextInputTypes(prev => [
                              ...prev,
                              { label: removedType, value: removedType },
                            ]);
                          }}
                        >
                          <Cross size={20} color="#888" fill="red" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
                {item.type === 'dropdown' &&
                  item.data.inputType === 'intrests' && (
                    <View style={styles.row}>
                      <Text style={styles.labelText}>Interests</Text>
                      <MultiSelect
                        // style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={item?.data?.data}
                        labelField="label"
                        valueField="value"
                        placeholder="Select interests"
                        searchPlaceholder="Search..."
                        value={item?.data?.value} // Ensure `value` is correctly passed as array
                        onChange={selectedVals => {
                          // Handle multi-select value update (selectedVals is an array)
                          setFieldsState(prev =>
                            prev.map(f =>
                              f.data.label === item.data.label
                                ? {
                                    ...f,
                                    data: {
                                      ...f.data,
                                      value: selectedVals, // Update the array of selected values
                                      error: '',
                                    },
                                  }
                                : f,
                            ),
                          );

                          item.data?.onChange(selectedVals); // Optionally update parent state
                        }}
                        style={[
                          styles.dropdown,
                          item.data.error && {
                            borderColor: 'red',
                            borderWidth: 1,
                          },
                        ]}
                        selectedStyle={styles.dropdown}
                      />
                      {!item.data?.required && (
                        <View
                          style={{
                            transform: [{ rotate: '45deg' }],
                          }}
                        >
                          <Pressable
                            onPress={() => {
                              const removedType = item.data.inputType;

                              setFieldsState(prev =>
                                prev.filter(
                                  f => f.data.inputType !== removedType,
                                ),
                              );

                              setTextInputTypes(prev => [
                                ...prev,
                                { label: removedType, value: removedType },
                              ]);
                            }}
                          >
                            <Cross size={20} color="#888" fill="red" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}

                {item.type === 'dropdown' &&
                  item.data.inputType != 'intrests' && (
                    <View style={styles.row}>
                      <Text style={styles.labelText}>{item.data?.label}</Text>
                      <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        data={item?.data?.data}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus && item?.data?.placeholder}
                        searchPlaceholder="Search..."
                        value={item.data?.value}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={selectedVal => {
                          // Update height value in fieldsState
                          setFieldsState(prev =>
                            prev.map(f =>
                              f.data.label === item.data.label
                                ? {
                                    ...f,
                                    data: {
                                      ...f.data,
                                      value: selectedVal.value, // Update the value of height
                                      error: '',
                                    },
                                  }
                                : f,
                            ),
                          );
                          item.data?.onChange(selectedVal.value); // Optionally update parent state
                        }}
                      />
                      {!item.data?.required && (
                        <View
                          style={{
                            transform: [{ rotate: '45deg' }],
                          }}
                        >
                          <Pressable
                            onPress={() => {
                              setFieldsState(prev =>
                                prev.filter(
                                  f => f.data.inputType !== item.data.inputType,
                                ),
                              );
                            }}
                          >
                            <Cross size={20} color="#888" fill="red" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}

                {item.type === 'datePicker' && (
                  <View>
                    <>
                      <View style={styles.row}>
                        <Text style={styles.labelText}>DOB : </Text>
                        <TouchableOpacity onPress={() => setOpen(true)}>
                          <Text
                            style={{
                              fontSize: 16,
                              color: '#333',
                              fontWeight: '600',
                            }}
                          >
                            {item.data?.value.toDateString()}
                          </Text>
                        </TouchableOpacity>

                        <DatePicker
                          modal
                          mode="date"
                          open={open}
                          date={date}
                          maximumDate={new Date()}
                          onConfirm={d => {
                            setOpen(false);
                            item.data?.onChange(d); // Update date value

                            // Validate the date after it's selected
                            const err = validateField({
                              ...item,
                              data: { ...item.data, value: d },
                            });

                            // Update the fieldsState to reflect the new error or success
                            setFieldsState(prev =>
                              prev.map(f =>
                                f.data.label === item.data.label
                                  ? {
                                      ...f,
                                      data: {
                                        ...f.data,
                                        value: d,
                                        error: err,
                                      },
                                    }
                                  : f,
                              ),
                            );
                          }}
                          onCancel={() => setOpen(false)}
                        />
                        {!item.data?.required && (
                          <View
                            style={{
                              transform: [{ rotate: '45deg' }],
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                setFieldsState(prev =>
                                  prev.filter(
                                    f =>
                                      f.data.inputType !== item.data.inputType,
                                  ),
                                );
                              }}
                            >
                              <Cross size={20} color="#888" fill="red" />
                            </Pressable>
                          </View>
                        )}
                      </View>

                      {/* <DatePicker date={date} onDateChange={setDate} /> */}
                      {/* <Button title="Open" onPress={() => setOpen(true)} /> */}
                    </>
                  </View>
                )}
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />

        <TouchableOpacity
          style={[styles.submitBtn, !formValid && { backgroundColor: '#888' }]}
          onPress={handleSubmit}
            disabled={!btnAvailable()}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  console.log('fieldsState>>>>>>>>>>>>', fieldsState);

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderLabel()}
        <Dropdown
          style={[styles.topDropdown, isFocus && styles.topDropdownFocused]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={fieldTypes}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select item' : '...'}
          searchPlaceholder="Search..."
          value={fieldType}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setFieldType(item.value);
            setIsFocus(false);
          }}
        />
        <Button
          title={'Add Field'}
          onPress={() => {
            setIsShowAddField(true);
          }}
        />
        {addingInputFields(fieldType)}
        {formData()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 16,
    paddingBottom: 30,
  },

  formWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1A1A1A',
  },

  topDropdown: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    paddingHorizontal: 12,
    marginBottom: 16,

    // Shadow for top dropdown (subtle)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topDropdownFocused: {
    borderColor: '#1A73E8',
    shadowColor: '#1A73E8',
    shadowOpacity: 0.15,
  },

  row: {
    // flex:1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },

  labelText: {
    width: 110,
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },

  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    color: '#111',
  },

  headerDropdown: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F4F7',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  dropdown: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F4F7',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  placeholderStyle: {
    color: '#999',
    fontSize: 15,
  },

  selectedTextStyle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },

  iconStyle: {
    width: 20,
    height: 20,
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 15,
  },

  dynamicBtn: {
    marginTop: 5,
    backgroundColor: '#EEF6FF',
    borderRadius: 8,
    paddingVertical: 10,
  },

  dynamicBtnText: {
    textAlign: 'center',
    color: '#1A73E8',
    fontSize: 14,
    fontWeight: '600',
  },

  showSection: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  submitBtn: {
    backgroundColor: '#1A73E8',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  submitBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
