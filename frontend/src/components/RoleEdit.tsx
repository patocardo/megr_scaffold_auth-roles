import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Container,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  FormHelperText,
  Checkbox,
  Box,
  Grid,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import useGraphQL from '../utils/use-graphql';
import { BannerError } from '../globals/error-handling';
import useFormStyles from '../utils/use-form-styles';
import useEffectDeep from '../utils/use-effect-deep';
import BannerAlert from './BannerAlert';
import keyGenerate from '../utils/string';

type RoleType = {
  roleId: string,
  name: string,
  description: string,
  resolvers: string[]  
}

const newData: RoleType = {
  roleId: '_',
  name: '',
  description: '',
  resolvers: [],
}

const errorInputs = {
  name: false,
  description: false,
  resolvers: false,
};

const rtrnAPI = `{
  roleId: _id
  name
  description
  resolvers
}`;

export default function RoleEdit() {
  const formClasses = useFormStyles();
  const [ stateData, setStateData ] = useState<RoleType>(newData);
  const { data: responseData, flag, errors, fetchData } = useGraphQL<RoleType>(newData);
  const { data: resolversData, errors: resolverErrors, fetchData: fetchResolver} = useGraphQL<string[]>([]);
  const [ status, setStatus ] = useState('input');
  const [ inputError, setInputError ] = useState(errorInputs);
  const mounted = useRef(false);
  const history = useHistory();
  const {id} = useParams();

  useEffect(() => {
    if(!mounted.current) {
      if (!id) history.push('/roles');
      else {
        fetchResolver({expression: `query {
          resolvers
        }`, isAuth: true});
        if (id !== '_') {
          fetchData({ expression:`query{
            roleResponse: roleById(id:"${id}") ${rtrnAPI}
          }`, isAuth: true, flag: 'get'});
        }
      }
    }
  }, [id, fetchResolver, history, fetchData]);

  useEffect(() => {
    const validation = {
      name: stateData.name.length < 3,
      description: stateData.description.length < 6,
      resolvers: stateData.resolvers.length === 0,
    };
    setInputError(validation); 
  }, [stateData.name, stateData.description, stateData.resolvers.length]);

  useEffectDeep(() => {
    if (status === 'save') {
      const { roleId, name, description, resolvers } = stateData;
      const resolver = (roleId === '_') ? 'roleCreate(' : `roleUpdate(id: "${roleId}", `;
      const expression = `mutation {
        roleResponse: ${resolver}roleInput: {
          name: "${name}",
          description: "${description}",
          resolvers: ["${resolvers.join('", "')}"]
        })${rtrnAPI}
      }`;
      const flag = (roleId === '_') ? 'create' : 'update';
      fetchData({expression, isAuth: true, flag});
      setStatus('sending');
    }
  }, [status, stateData, fetchData]);

  useEffectDeep(() => {
    if (responseData) {
      setStateData({...responseData});
      if (['create', 'update'].includes(flag)) {
        setStatus('saved');  
      }
      if(flag === 'create') {
        history.replace(`/role/${responseData.roleId}`);
      }
    } 
  }, [responseData, flag, history]);

  function handleText(field: string) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      setStateData({...stateData, [field]: evt.target.value})
    }
  }

  function isResolverSelected(resolver: string): boolean {
    return stateData.resolvers.includes(resolver);
  }

  function handleResolverChange(item: string) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const resolvers = (event.target.checked)
        ? [...stateData.resolvers, item]
        : stateData.resolvers.filter(resolver => resolver !== item);
      setStateData((prev: RoleType) => ({...prev, resolvers}));
    }
  }

  function saveUser() {
    if (Object.values(inputError).some(ierr => ierr)) return false;
    setStatus('save');
  }

  function cancelEdit() {
    if(responseData) {
      setStateData({...responseData});
    }
  }

  if (status === 'sending') {
    return (
      <Container>  
        <Grid container justify="center">
          <Grid item xs={12}>
            <Typography>Saving Role's data</Typography>
          </Grid>
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container>
      <Box m={1}>
        <Button
          variant="text"
          color="primary"
          size="small"
          startIcon={<ArrowBackIosIcon />}
          onClick={() => history.push('/roles')}
        >
          Return to list
        </Button>        
      </Box>
      <BannerAlert
        severity="success"
        isOpen={status === 'saved'}
        closeFn={() => setStatus('input')}
        title="Role saved"
        body={'Data of role ' + stateData.name + ' was successfully saved on DataBase'}
      />
      <BannerError
        errors={[errors, resolverErrors]}
      />
      <Box m={2}>
        <Typography variant="h6" gutterBottom>
          Role details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="name"
              label="Name"
              value={stateData.name}
              fullWidth
              autoComplete="name"
              onChange={handleText('name')}
              error={inputError.name}
              helperText={inputError.name && 'Put a valid name'}
          />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="description"
              label="Description"
              fullWidth
              autoComplete="description"
              value={stateData.description}
              onChange={handleText('description')}
              error={inputError.description}
              helperText={inputError.description && 'Invalid description'}
            />
          </Grid>
          <FormControl component="fieldset">
            <FormLabel component="legend">Assign responsibility</FormLabel>
            <FormGroup>
              <Grid container>
                {
                  resolversData && resolversData.map((resolver: string) => {
                    return (
                      <Grid item xs={6} md={4} lg={3} key={keyGenerate(resolver, 10)}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={isResolverSelected(resolver)} 
                              onChange={handleResolverChange(resolver)} 
                              name={resolver}
                            />
                          }
                          label={resolver}
                        />
                      </Grid>
                    )
                  })
                }
              </Grid>
            </FormGroup>
            <FormHelperText >Be careful</FormHelperText>
          </FormControl>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <FormControl className={formClasses.formControl}>
                <Button variant="contained" onClick={cancelEdit}>Cancel</Button>
              </FormControl>
              <FormControl className={formClasses.formControl}>
                <Button variant="contained" color="primary" onClick={saveUser}>
                  Save
                </Button>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
