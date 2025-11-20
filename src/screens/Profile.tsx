import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { addProfileRecord, getProfileRecord } from '../database/profileService';
import { UserContext } from '../context/UserContext';

const data = [
  { label: 'Open Form', value: 1 },
  { label: 'Open Form with DOB', value: 2 },
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

// type Field = {
//   id: number;
//   type: 'text_input' | 'text_area' | 'dropdown' | 'multi-dropdown' | 'date';
//   data: {
//     label: string;
//     value: any;
//     placeholder?: string;
//     required?: boolean;
//     minLength?: number;
//     maxLength?: number;
//     rule?: (v: any) => boolean;
//     data?: any[];
//     onChange: (v: any) => void;
//     error: string;
//   };
// };

export default function Profile() {
  const [formtype, setFormtype] = useState(0);
  const [isFocus, setIsFocus] = useState(false);
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [label2, setLabel2] = useState('');
  const [userHeight, setUserHeight] = useState(0);
  const [intrests, setIntrests] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [gender, setGender] = useState('');

  const [open, setOpen] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const { user } = useContext(UserContext);
  const [formValid, setFormValid] = useState(false);

  const fields = useMemo(
    () => [
      {
        type: 'text_input',
        data: {
          label: 'Label',
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
        type: 'text_input',
        data: {
          label: 'Name',
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
        type: 'text_input',
        data: {
          label: 'Email',
          minLength: 6,
          maxLength: 255,
          required: true,
          value: email,
          placeholder: 'Enter your email',
          onChange: setEmail,
          rule: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          error: '',
        },
      },
      {
        type: 'text_input',
        data: {
          label: 'Phone',
          minLength: 10,
          maxLength: 10,
          required: true,
          value: phone,
          placeholder: 'Enter phone number',
          onChange: setPhone,
          rule: value => /^[0-9]{10}$/.test(value),
          error: '',
        },
      },
      {
        type: 'text_input',
        data: {
          label: 'Address',
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
        type: 'text_area',
        data: {
          label: 'Additional Info',
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
          label: 'Height (FT)',
          data: height,
          required: true,
          value: userHeight,
          placeholder: 'Select height',
          onChange: setUserHeight,
          rule: value => value >= 1 && value <= 8,
          error: '',
        },
      },
      {
        type: 'dropdown',
        data: {
          label: 'Gender',
          data: genderCategories,
          required: false,
          value: gender,
          placeholder: 'Select gender',
          onChange: setGender,
          error: '',
        },
      },
      {
        type: 'multi-dropdown',
        data: {
          label: 'Interests',
          data: intrestsCategories,
          required: false,
          value: intrests,
          placeholder: 'Select interests',
          onChange: setIntrests,
          error: '',
        },
      },
      {
        type: 'date',
        data: {
          label: 'Birth Date',
          required: false,
          value: date,
          placeholder: 'Select birth date',
          onChange: setDate,
          rule: value => {
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
  const [fieldsState, setFieldsState] = useState(fields);

  const renderLabel = () => {
    if (formtype || isFocus) {
      return (
        <Text style={[styles.sectionTitle, isFocus && { color: 'blue' }]}>
          Dropdown label are here
        </Text>
      );
    }
    return null;
  };

  useEffect(() => {
    let isValid = true; 
    const updatedFieldsState = [...fieldsState]; 

    fieldsState.forEach(item => {
      const err = validateField(item);
      if (err) {
        isValid = false; 
      }

      updatedFieldsState.forEach(f => {
        if (f.data.label === item.data.label) {
          f.data.error = err; 
        }
      });
    });

    setFieldsState(updatedFieldsState); 
    setFormValid(isValid); 
  }, [name, email, label, userHeight, phone]); 

  const validateField = field => {
    const v = field?.data?.value;
    const rule = field?.data?.rule;

    if (!field?.data?.required && !v) {
      return '';
    }

    // Required check
    if (field?.data?.required && !v) {
      return `${field.data.label} is required`;
    }

    // Min length check
    if (field?.data?.minLength && v.length < field?.data?.minLength) {
      return `${field.data.label} must be at least ${field.data.minLength} characters`;
    }

    // Max length check
    if (field?.data?.maxLength && v.length > field?.data?.maxLength) {
      return `${field.data.label} must be less than ${field.data.maxLength} characters`;
    }

    // Custom rule check
    if (rule && !rule(v)) {
      return `${field.data.label} is invalid`;
    }

    return ''; // Return empty string if no error
  };

  const handleSubmit = async () => {
    const payload = {
      userId: user?.id,
      label,
      name,
      phone,
      email,
      height: userHeight,
      address,
      additionalText: additionalInfo,
      label2,
      intrests,
      dob: date,
    };

    try {
      const result = await addProfileRecord(payload as any);
      console.log('🚀 ~ handleSubmit ~ result:', result);
      setDataSaved(true);
      console.log('Profile added:', result);

      if (result)
        Alert.alert('Sucess', 'your information has been saved sucessfuly');
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert('Error', 'your data cannot be saved');
    }
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.topDropdown, isFocus && styles.topDropdownFocused]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select item' : '...'}
        searchPlaceholder="Search..."
        value={formtype}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setFormtype(item.value);
          setIsFocus(false);
        }}
      />

      {formtype && (
        <>
          <FlatList
            data={fieldsState}
            renderItem={({ item, index }) => {
              return (
                <View>
                  {item.type === 'text_input' && (
                    <View style={styles.row}>
                      <Text style={styles.labelText}>{item.data?.label} </Text>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          value={item.data.value}
                          placeholder={item.data.placeholder}
                          maxLength={item.data.maxLength}
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
                    </View>
                  )}
                  {item.type === 'dropdown' &&
                    item.data?.label === 'Height (FT)' && (
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
                          placeholder={!isFocus ? 'Select height' : '...'}
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
                      </View>
                    )}

                  {item.type === 'multi-dropdown' && (
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
                    </View>
                  )}

                  {item.type === 'date' && (
                    <View>
                      {formtype == 2 && (
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
                          </View>

                          {/* <DatePicker date={date} onDateChange={setDate} /> */}
                          {/* <Button title="Open" onPress={() => setOpen(true)} /> */}
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              !formValid && { backgroundColor: '#888' },
            ]}
            onPress={handleSubmit}
            disabled={!formValid}
          >
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
