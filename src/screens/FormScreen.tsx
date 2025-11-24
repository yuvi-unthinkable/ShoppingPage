// FormScreen.tsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import { getRecordData, updateProfile } from '../database/profileService';
import { UserContext } from '../context/UserContext';
import { Cross } from 'lucide-react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigators/type';

type FormScreenRouteProp = RouteProp<RootStackParamList, 'FormScreen'>;

type Field =
  | {
      type: 'text-input';
      data: {
        label: string;
        inputType?: string;
        value: string;
        placeholder?: string;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        rule?: (v: any) => boolean;
        error?: string;
      };
    }
  | {
      type: 'dropdown';
      data: {
        label: string;
        inputType?: 'height' | 'gender' | 'intrests' | string;
        value: any;
        data?: Array<{ label: string; value: any }>;
        placeholder?: string;
        required?: boolean;
        rule?: (v: any) => boolean;
        error?: string;
      };
    }
  | {
      type: 'datePicker';
      data: {
        label: string;
        value: Date | null;
        required?: boolean;
        rule?: (v: Date) => boolean;
        error?: string;
      };
    };

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

export default function FormScreen() {
  const { user } = useContext(UserContext);
  const route = useRoute<FormScreenRouteProp>();
  const { id } = route.params;

  const [loading, setLoading] = useState<boolean>(true);
  const [fieldsState, setFieldsState] = useState<Field[]>([]);
  const [openPickerLabel, setOpenPickerLabel] = useState<string | null>(null); // which date picker is open
  const [isFocus, setIsFocus] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // ======= Helpers =======
  const safeParse = (maybeString: any) => {
    try {
      if (typeof maybeString === 'string') return JSON.parse(maybeString);
      return maybeString;
    } catch (e) {
      return maybeString;
    }
  };

  // convert server object to editable field array
  const convertToEditableFields = useCallback(
    (obj: Record<string, any>): Field[] => {
      if (!obj || typeof obj !== 'object') return [];

      return Object.entries(obj).map(([rawLabel, rawValue]): Field => {
        const label = rawLabel; // keep original label (like "Text area", "Dob", "Intrest")
        // Date field
        if (
          label.toLowerCase() === 'dob' ||
          label.toLowerCase() === 'date of birth'
        ) {
          const value = rawValue ? new Date(rawValue) : null;
          return {
            type: 'datePicker',
            data: {
              label,
              value,
              required: false,
              rule: (d: Date) => {
                if (!d) return true;
                const today = new Date();
                let age = today.getFullYear() - d.getFullYear();
                const md = today.getMonth() - d.getMonth();
                if (md < 0 || (md === 0 && today.getDate() < d.getDate()))
                  age--;
                return age >= 10;
              },
              error: '',
            },
          };
        }

        // Interests (array)
        if (
          label.toLowerCase().includes('intrest') ||
          label.toLowerCase().includes('interest')
        ) {
          return {
            type: 'dropdown',
            data: {
              label,
              inputType: 'intrests',
              value: Array.isArray(rawValue) ? rawValue : [],
              data: intrestsCategories,
              required: false,
              error: '',
            },
          };
        }

        // Height numeric mapped to dropdown
        if (label.toLowerCase() === 'height') {
          return {
            type: 'dropdown',
            data: {
              label,
              inputType: 'height',
              value: rawValue ?? null,
              data: height,
              required: true,
              rule: (v: number) => v >= 1 && v <= 8,
              error: '',
            },
          };
        }

        // Gender dropdown
        if (label.toLowerCase() === 'gender') {
          return {
            type: 'dropdown',
            data: {
              label,
              inputType: 'gender',
              value: rawValue ?? null,
              data: genderCategories,
              required: false,
              error: '',
            },
          };
        }

        // Phone / Email / Name have specific validations
        if (label.toLowerCase() === 'phone') {
          return {
            type: 'text-input',
            data: {
              label,
              inputType: 'Phone',
              value: rawValue ?? '',
              placeholder: 'Enter phone number',
              required: true,
              minLength: 10,
              maxLength: 10,
              rule: (v: string) => /^[0-9]{10}$/.test(String(v)),
              error: '',
            },
          };
        }

        if (label.toLowerCase() === 'email') {
          return {
            type: 'text-input',
            data: {
              label,
              inputType: 'Email',
              value: rawValue ?? '',
              placeholder: 'Enter your email',
              required: true,
              minLength: 6,
              maxLength: 255,
              rule: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)),
              error: '',
            },
          };
        }

        if (label.toLowerCase() === 'name') {
          return {
            type: 'text-input',
            data: {
              label,
              inputType: 'Name',
              value: rawValue ?? '',
              placeholder: 'Enter your name',
              required: true,
              minLength: 2,
              maxLength: 100,
              error: '',
            },
          };
        }

        // Text area detection
        if (
          label.toLowerCase().includes('text area') ||
          label.toLowerCase().includes('text')
        ) {
          return {
            type: 'text-input',
            data: {
              label,
              inputType: 'textArea',
              value: rawValue ?? '',
              placeholder: 'Enter details...',
              required: false,
              maxLength: 1000,
              error: '',
            },
          };
        }

        // Default fallback -> simple text-input
        return {
          type: 'text-input',
          data: {
            label,
            value: rawValue ?? '',
            placeholder: `Enter ${label}`,
            required: false,
            error: '',
          },
        };
      });
    },
    [],
  );

  // update one field by label
  const updateField = useCallback(
    (label: string, patch: Partial<Field['data']>) => {
      setFieldsState(prev =>
        prev.map(f => {
          if (f.data.label !== label) return f;
          return { ...f, data: { ...f.data, ...patch } } as Field;
        }),
      );
    },
    [],
  );

  // validate single field -> returns error string or ''
  const validateField = useCallback((field: Field): string => {
    const v: any = field.data.value;
    const rule = (field.data as any).rule;
    const required = !!field.data.required;
    const minLength = (field.data as any).minLength;
    const maxLength = (field.data as any).maxLength;
    const label = field.data.label ?? 'Field';

    // empty and not required
    if (
      !required &&
      (v === '' ||
        v === null ||
        v === undefined ||
        (Array.isArray(v) && v.length === 0))
    )
      return '';

    if (required) {
      const empty =
        v === '' ||
        v === null ||
        v === undefined ||
        (Array.isArray(v) && v.length === 0);
      if (empty) return `${label} is required`;
    }

    if (typeof v === 'string' && minLength && v.length < minLength) {
      return `${label} must be at least ${minLength} characters`;
    }

    if (typeof v === 'string' && maxLength && v.length > maxLength) {
      return `${label} must be less than ${maxLength} characters`;
    }

    if (rule && !rule(v)) {
      return `${label} is invalid`;
    }

    return '';
  }, []);

  // check if submit button should be enabled
  const btnAvailable = useCallback(() => {
    if (!fieldsState || fieldsState.length === 0) return false;
    for (const f of fieldsState) {
      const err = validateField(f);
      if (err) return false;
    }
    return true;
  }, [fieldsState, validateField]);

  // ======= Load record from DB and map to fieldsState =======
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const record = await getRecordData(id);
        // record could have userData as JSON string or already parsed object
        const parsed = safeParse(record?.userData ?? record);
        const mapped = convertToEditableFields(parsed);
        if (!mounted) return;
        setFieldsState(mapped);
      } catch (err) {
        console.error('Error loading record', err);
        Alert.alert('Error', 'Could not load form data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, convertToEditableFields]);

  // recompute form validity when fieldsState changes
  useEffect(() => {
    setFormValid(btnAvailable());
  }, [fieldsState, btnAvailable]);

  // ======= Submit handler =======
  const handleUpdate = async () => {
    // run a final validation
    const errors = fieldsState
      .map(f => ({ label: f.data.label, err: validateField(f) }))
      .filter(x => x.err);
    if (errors.length) {
      Alert.alert(
        'Validation failed',
        errors.map(e => `${e.label}: ${e.err}`).join('\n'),
      );
      // also set field errors visually
      setFieldsState(prev =>
        prev.map(f => ({ ...f, data: { ...f.data, error: validateField(f) } })),
      );
      return;
    }

    // build final payload object (label -> value)
    const finalData = fieldsState.reduce<Record<string, any>>((acc, f) => {
      acc[f.data.label] = f.data.value;
      return acc;
    }, {});

    try {
      // Adjust the payload to your updateProfile expectation. I include userId and id by default.
      const userData = JSON.stringify(finalData);
      const result = await updateProfile(id, userData);
      setLoading(false);
      console.log('Update result', result);
      Alert.alert('Success', 'Your information has been updated successfully.');
    } catch (err) {
      setLoading(false);
      console.error('Update error', err);
      Alert.alert('Error', 'Could not save your data. Try again.');
    }
  };

  // ======= Renderers =======
  const renderTextInput = (item: Field) => {
    return (
      <View style={styles.row}>
        <Text style={styles.labelText}>{item.data.label}</Text>
        <View style={{ flex: 1 }}>
          <TextInput
            value={String(item.data.value ?? '')}
            placeholder={item.data.placeholder ?? ''}
            maxLength={(item.data as any).maxLength}
            multiline={(item.data as any).inputType === 'textArea'}
            onBlur={() => {
              const err = validateField(item);
              updateField(item.data.label, { error: err });
            }}
            onChangeText={text => {
              updateField(item.data.label, { value: text });
              // realtime validate
              const err = validateField({
                ...item,
                data: { ...item.data, value: text },
              });
              updateField(item.data.label, { error: err });
            }}
            style={[
              {
                height: (item.data as any).inputType === 'textArea' ? 100 : 48,
              },
              styles.input,
              item.data.error ? { borderColor: 'red', borderWidth: 1 } : null,
            ]}
          />
          {item.data.error ? (
            <Text style={{ color: 'red' }}>{item.data.error}</Text>
          ) : null}
        </View>

        {/* non-required remove button (if applicable) */}
        {!item.data.required && (
          <View style={{ marginLeft: 8, transform: [{ rotate: '45deg' }] }}>
            <Pressable
              onPress={() => {
                setFieldsState(prev =>
                  prev.filter(f => f.data.label !== item.data.label),
                );
              }}
            >
              <Cross size={20} color="#888" fill="red" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderDropdown = (item: Field) => {
    const inputType = (item.data as any).inputType;
    // interests multi-select
    if (inputType === 'intrests') {
      return (
        <View style={styles.row}>
          <Text style={styles.labelText}>{item.data.label}</Text>
          <MultiSelect
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={(item.data as any).data ?? intrestsCategories}
            labelField="label"
            valueField="value"
            placeholder="Select interests"
            searchPlaceholder="Search..."
            value={item.data.value || []}
            onChange={(selectedVals: any[]) => {
              updateField(item.data.label, { value: selectedVals, error: '' });
            }}
            style={[
              styles.dropdown,
              item.data.error ? { borderColor: 'red', borderWidth: 1 } : null,
            ]}
            selectedStyle={styles.dropdown}
          />
          {!item.data.required && (
            <View style={{ marginLeft: 8, transform: [{ rotate: '45deg' }] }}>
              <Pressable
                onPress={() =>
                  setFieldsState(prev =>
                    prev.filter(f => f.data.label !== item.data.label),
                  )
                }
              >
                <Cross size={20} color="#888" fill="red" />
              </Pressable>
            </View>
          )}
        </View>
      );
    }

    // regular dropdown
    return (
      <View style={styles.row}>
        <Text style={styles.labelText}>{item.data.label}</Text>
        <Dropdown
          style={[
            styles.dropdown,
            item.data.error ? { borderColor: 'red', borderWidth: 1 } : null,
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={(item.data as any).data ?? []}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={item.data.placeholder ?? 'Select...'}
          searchPlaceholder="Search..."
          value={item.data.value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            const err = validateField(item);
            updateField(item.data.label, { error: err });
          }}
          onChange={selectedVal => {
            // selectedVal could be object with value property
            const val = selectedVal?.value ?? selectedVal;
            updateField(item.data.label, { value: val, error: '' });
          }}
        />
        {!item.data.required && (
          <View style={{ marginLeft: 8, transform: [{ rotate: '45deg' }] }}>
            <Pressable
              onPress={() =>
                setFieldsState(prev =>
                  prev.filter(f => f.data.label !== item.data.label),
                )
              }
            >
              <Cross size={20} color="#888" fill="red" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderDatePicker = (item: Field) => {
    const value = (item.data.value as Date) ?? null;
    return (
      <View style={styles.row}>
        <Text style={styles.labelText}>{item.data.label}</Text>

        <TouchableOpacity
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setOpenPickerLabel(item.data.label)}
        >
          <Text style={{ fontSize: 15, color: value ? '#111' : '#999' }}>
            {value ? value.toDateString() : 'Select date'}
          </Text>
        </TouchableOpacity>

        <DatePicker
          modal
          mode="date"
          open={openPickerLabel === item.data.label}
          date={value ?? new Date()}
          maximumDate={new Date()}
          onConfirm={d => {
            setOpenPickerLabel(null);
            updateField(item.data.label, { value: d });
            const err = validateField({
              ...item,
              data: { ...item.data, value: d },
            });
            updateField(item.data.label, { error: err });
          }}
          onCancel={() => setOpenPickerLabel(null)}
        />

        {!item.data.required && (
          <View style={{ marginLeft: 8, transform: [{ rotate: '45deg' }] }}>
            <Pressable
              onPress={() =>
                setFieldsState(prev =>
                  prev.filter(f => f.data.label !== item.data.label),
                )
              }
            >
              <Cross size={20} color="#888" fill="red" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  // main item renderer
  const renderItem = ({ item }: { item: Field }) => {
    if (item.type === 'text-input') return renderTextInput(item);
    if (item.type === 'dropdown') return renderDropdown(item);
    if (item.type === 'datePicker') return renderDatePicker(item);
    return null;
  };

  // ======= UI =======
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fieldsState.length === 0 ? (
        <View style={{ padding: 16 }}>
          <Text>No form fields found.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={fieldsState}
            renderItem={renderItem}
            keyExtractor={item => item.data.label}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              !formValid && { backgroundColor: '#888' },
            ]}
            onPress={handleUpdate}
            disabled={!formValid}
          >
            <Text style={styles.submitBtnText}>Update</Text>
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
