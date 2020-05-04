import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  Dialog ,
  DialogActions ,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import useCummulativeDelay from '../utils/use-delay';
import DataWrapper from './DataWrapper';
import useGraphQL from '../utils/use-graphql';
import EnhancedTable from './EnhancedTable';
import BannerAlert from './BannerAlert';
import { ErrorType, hasErrors } from '../globals/error-handling';
import { StateContext } from '../globals/context';
import useFormStyles from '../utils/use-form-styles';
import keyGenerate from '../utils/string';

type FilterType = {
  search: string,
  roleId: string
}

type userDataType = {
  userId: string,
  name: string,
  email: string,
  roles: {
    roleId: string
    name: string
  }[]
}

type usersDataType = {
  users: userDataType[]
}

type UsersRemoveReturnType = {
  usersRemove: number
}

type userType = {
  userId: string,
  name: string,
  email: string,
  roles: string
}

type roleType = {
  roleId: string,
  name: string
}

type rolesDataType = {
  roles: roleType[]
}

type PrepareDeleteType = {
  confirm: number,
  ids: string[],
  usersText: string[]
}

const initialFilter: FilterType = {
  search: '',
  roleId: ''
}

function makeListExpression(filter: FilterType): string {
  return `
    query {
      users(search: "${filter.search}", role: "${filter.roleId}") {
        userId: _id
        name
        email
        roles{
          roleId: _id
          name
        }
      }
    }
  `;
}

function getDeletionStrings(usersText: string[], future: boolean = false): string[] {
  const verb = (future) ? ' are marked for delete': ' has been deleted';
  return (usersText.length === 0)
    ? ['There is no item selected for removal']
    : (usersText.length < 11)
      ? [`The following users ${verb}:`, 
        ...usersText]
      : [`${usersText.length} users ${verb}`];
}

const noneDelete: PrepareDeleteType = {confirm: 0, ids: [], usersText: []};

const headCells = [
  {
    disablePadding: false,
    id: 'name',
    label: 'Name',
    numeric: false
  },
  {
    disablePadding: false,
    id: 'email',
    label: 'E-mail',
    numeric: false
  },
  {
    disablePadding: false,
    id: 'roles',
    label: 'Roles',
    numeric: false
  }
];

export default function Users() {
  const [usersDisplay, setUsersDisplay] = useState<userType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [errors, setErrors] = useState<ErrorType[] | null>(null);
  const [filter, setFilter] = useState(initialFilter);
  const setDelayFilter = useCummulativeDelay(10000);
  const deletedData = useGraphQL<UsersRemoveReturnType>('post');
  const usersData = useGraphQL<usersDataType>('post');
  const rolesData = useGraphQL<rolesDataType>('post');
  const { state, dispatch } = useContext(StateContext);
  const classes = useFormStyles();
  const [searchText, setSearchText] = useState('');
  const [prepareDelete, setPrepareDelete] = useState<PrepareDeleteType>(noneDelete);
  const history = useHistory();

  useEffect(() => {
    rolesData.fetchData(`
      query {
        roles {
          roleId: _id
          name
        }
      }
    `, true);
    usersData.fetchData(makeListExpression(filter), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    usersData.fetchData(makeListExpression(filter), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (usersData.result) {
      setIsLoading(false);
      const { data, token } = usersData.result;
      if ( data && data?.users?.length > 0) {
        const newUsers: userType[] = data.users.map(user => ({
          ...user,
          roles: user.roles.map(role => role.name).join(', ')
        }));
        setUsersDisplay(newUsers)
      }
      if( token && state.loginInfo?.email) {
        dispatch({ type: 'SIGNEDIN', payload: { loginInfo: { email: state.loginInfo.email, token} }});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData.result]);

  useEffect(() => {
    setDelayFilter(() => {
      setFilter({...filter, search: searchText})
    });
  }, [searchText]);

  useEffect(() => {
    if(prepareDelete.confirm === 2 && prepareDelete.ids.length > 0) {
      const cargo = `
        mutation {
          usersRemove(ids: ["${prepareDelete.ids.join('", "')}"])
        }
      `;
      deletedData.fetchData(cargo, true);
    }
  }, [prepareDelete.confirm]);

  useEffect(() => {
    if(deletedData?.result && deletedData?.result.data?.usersRemove) {
      // TODO: check integrity
      usersData.fetchData(makeListExpression(filter), true);
    }
  }, [deletedData.result])

  function handleSearch(evt: React.ChangeEvent<{ value: string }>) {
    setSearchText(evt.target.value);
  }

  function handleRole(evt: React.ChangeEvent<{ value: unknown }>) {
    setDelayFilter(() => setFilter({...filter, roleId: evt.target.value as string}));
  }

  function handleEdit(id: string) {
    history.push('/user/' + id);
  }

  function handleAdd() {
    history.push('/user/_');
  }

  function handleDelete(ids: string[]) {
    if (!usersData?.result?.data?.users) return;
    const usersText = usersData.result.data.users.filter(user => {
      return ids.includes(user.userId);
    }).map(user => `${user.name}<${user.email}`);
    setPrepareDelete({confirm: 1, ids, usersText});
  }

  function hasDeleted(): boolean {
    return (
      deletedData.result &&
      deletedData.result.data &&
      deletedData.result.data.usersRemove
    ) ? true : false;
  }

  const roles = rolesData?.result?.data?.roles || [];

  const bodyBannerDeleted = (!deletedData.result?.data) ? '' : getDeletionStrings(prepareDelete.usersText);

  const toDeleteContent = (usersData?.result?.data?.users)
    ? getDeletionStrings(prepareDelete.usersText, true)
    : [];
  

  return (
    <Container>
     <Dialog
        open={prepareDelete.confirm === 1}
        onClose={() => setPrepareDelete(noneDelete)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Do you want to permanently remove users?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component='div'>
            <List dense={true}>
              {toDeleteContent.map((line) => (
                <ListItem key={keyGenerate(line, 10)}>
                  <ListItemText
                    primary={line}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPrepareDelete({...prepareDelete, confirm: 0})}
            color="secondary"
            variant="contained"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => setPrepareDelete({...prepareDelete, confirm: 2})}
            variant="contained"
            color="primary" 
            autoFocus
          >
            Confirm delete
          </Button>
        </DialogActions>
      </Dialog>
      <BannerAlert
        severity="success"
        isOpen={hasDeleted() && prepareDelete.confirm === 2}
        closeFn={() => setPrepareDelete(noneDelete)}
        title="Users successfully deleted"
        body={bodyBannerDeleted}
      />
      <BannerAlert
        severity="error"
        isOpen={hasErrors(deletedData.errors) && prepareDelete.confirm === 2}
        closeFn={() => setPrepareDelete(noneDelete)}
        title="Error while deleting records of users"
        body={deletedData.errors || 'Server error'}
      />
      <Box>
        <FormControl variant="outlined" className={classes.formControl}>
          <TextField
            variant="outlined"
            margin="normal"
            id="search"
            label="Search by name and email"
            autoComplete="search"
            name="search"
            autoFocus
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
        {
          roles.length > 0 && (
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="filter-role-label" className={classes.marginedTop}>Role</InputLabel>
              <Select
                label="Filter by Role"
                labelId="filter-role"
                id="demo-simple-select"
                value={filter.roleId}
                onChange={handleRole}
                className={classes.marginedTop}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {
                  roles.map(role => (<MenuItem value={role.roleId} key={role.roleId}>{role.name}</MenuItem>))
                }
              </Select>
            </FormControl>
          )
        }
      </Box>
      <DataWrapper isEmpty={usersDisplay.length === 0} isLoading={isLoading}>
        <EnhancedTable
          headCells={headCells}
          rows={usersDisplay}
          title="Users"
          idName="userId"
          editFn={handleEdit}
          deleteFn={handleDelete}
          addFn={handleAdd}
        />
      </DataWrapper>

    </Container>
  );
}
