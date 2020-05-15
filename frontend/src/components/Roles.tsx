import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Container,
  TextField,
  FormControl,
  InputAdornment
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { isEqual } from 'lodash';
import { useDebounce } from 'use-debounce';
import DataWrapper from './DataWrapper';
import useGraphQL from '../utils/use-graphql';
import usePrevious from '../utils/use-previous';
import {BannerError } from '../globals/error-handling';
import EnhancedTable from './EnhancedTable';
import useFormStyles from '../utils/use-form-styles';
import useMultipleDelete from '../utils/use-multiple-delete';

type RoleType = {
  roleId: string,
  name: string,
  description: string,
  resolvers: string[]
}

type RoleDisplayType = Pick<RoleType, 'roleId' | 'name' | 'description'> & {
  resolversCount: string
}

function makeListExpression(term: string): string {
  return `
    query {
      roles(search: "${term}") {
        roleId: _id
        name
        description
        resolvers
      }
    }
  `;
}

const headCells = [
  {
    disablePadding: false,
    id: 'name',
    label: 'Name',
    numeric: false
  },
  {
    disablePadding: false,
    id: 'description',
    label: 'Description',
    numeric: false
  },
  {
    disablePadding: false,
    id: 'resolversCount',
    label: 'Actions Enabled',
    numeric: true
  }
];

export default function Roles() {
  const [rolesDisplay, setRolesDisplay] = useState<RoleDisplayType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 1000);
  const { data, errors, fetchData } = useGraphQL<RoleType[] | null>(null);
  const prevRolesData = usePrevious(data);
  const classes = useFormStyles();
  const {MultiDelCompo, handleDelete} = useMultipleDelete({
    resolver: 'rolesRemove',
    collection: data || [],
    getId: (role: RoleType) => role.roleId,
    getItemText: (role) => `${role.name}(${role.description})`,
    modelNames: 'roles'
  });
  const mounted = useRef(false);
  const history = useHistory();

  useEffect(() => {
    if(!mounted.current) {
      fetchData({expression: makeListExpression(''), isAuth: true});
      mounted.current = true;
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData({expression:makeListExpression(debouncedSearch), isAuth: true});
  }, [fetchData, debouncedSearch]);

  useEffect(() => {
    if (!isEqual(data, prevRolesData)) {
      const newRoles: RoleDisplayType[] = (data === null)
        ? []
        : data.map(role => {
          const { resolvers, ...rest} = role;
          return { ...rest, resolversCount: resolvers.length.toString()};
        });
      setRolesDisplay(newRoles);
    }
  }, [data, prevRolesData]);

  function handleSearch(evt: React.ChangeEvent<{ value: string }>) {
    setSearchText(evt.target.value);
  }

  function handleEdit(id: string) {
    history.push('/role/' + id);
  }

  function handleAdd() {
    history.push('/role/_');
  }

  return (
    <Container>
      <MultiDelCompo />
      <BannerError
        message={`Error while fetching records of Roles`}
        errors={[errors]}
      />      
      <Grid container justify="flex-end">
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" className={classes.formControl}>
            <TextField
              variant="outlined"
              margin="normal"
              id="search"
              label="Search by name and description"
              autoComplete="search"
              name="search"
              autoFocus
              fullWidth
              onChange={handleSearch}
              value={searchText}
              InputProps={{
                endAdornment:(
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              
            />
          </FormControl>
        </Grid>
      </Grid>
      <DataWrapper<RoleType> items={data}>
        <EnhancedTable
          headCells={headCells}
          rows={rolesDisplay || []}
          title="Roles"
          idName="roleId"
          editFn={handleEdit}
          deleteFn={handleDelete}
          addFn={handleAdd}
        />
      </DataWrapper>

    </Container>
  );
}
