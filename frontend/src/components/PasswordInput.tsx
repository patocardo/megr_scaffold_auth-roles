import React, { useState, ChangeEvent, MouseEvent } from 'react';
import {
  FormControl,
  Input,
  InputLabel,
  InputAdornment,
  IconButton,
  FormHelperText,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import {isEqual} from 'lodash';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import keyGenerate from '../utils/string';
import useEffectDeep from '../utils/use-effect-deep';

type PIPropsType = {
  fieldId: string
  onChange: (value: string, hasError: boolean) => void,
  className?: string,
  label?: string,
  original?: string,
  validation?: 'none' | 'rules' | 'repeat',
}

// TODO: abstract rules and share with back-end
export function invalidRules(value: string): string[] {
  const nongood = [];
  if (value.length < 5) nongood.push('Password should be longer than 4 characters');
  if (!/\d/.test(value)) nongood.push('Password must have at least one digit');
  if (!/[a-z]/.test(value)) nongood.push('Password must have at least one lowercase character');
  if (!/[A-Z]/.test(value)) nongood.push('Password must have at least one uppercase character');
  return nongood;
}

export default function PasswordInput(props: PIPropsType) {
  const { className = '', onChange, fieldId, label = 'Password', validation = 'none', original } = props;
  const [ value, setValue] = useState('');
  const [ missing, setMissing] = useState<string[]>([]);
  const [ showPassword, setShowPassword] = useState(false);

  useEffectDeep(() => {
    onChange(value, missing.length === 0);
  }, [value, missing]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nongood: string[] = [];
    switch(validation) {
      case 'rules':
        invalidRules(value).forEach(rule => nongood.push(rule));
        break;
      case 'repeat':
        if (value !== original) nongood.push('Both password must be equals');
        break;
    }
    if(!isEqual(nongood, missing)) {
      setMissing(nongood);
    }
    setValue(event.target.value);
  }

  function handleClickShowPassword() {
    setShowPassword((prev) => !prev);
  };

  function handleMouseDownPassword(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  };

  return (
    <>
      <FormControl className={className} fullWidth>
        <InputLabel htmlFor={'adornment-password-' + fieldId}>{label}</InputLabel>
        <Input
          id={'adornment-password-' + fieldId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          error={missing.length > 0}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {
          missing.length > 0 && (
            <FormHelperText id={'password-helper' + fieldId} error component="div">
              <List dense={true}>
                {missing.map((rule) => (
                  <ListItem key={keyGenerate(rule, 10)}>
                    <ListItemText
                      primary={rule}
                    />
                  </ListItem>
                ))}
              </List>
            </FormHelperText>
          )
        }           
      </FormControl>
    </>
  )
}