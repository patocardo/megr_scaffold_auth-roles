import React, { useState, useEffect, ReactElement, useReducer } from 'react';
import {
  Button,
  Dialog ,
  DialogActions ,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import { hasErrors } from '../globals/error-handling';
import BannerAlert from '../components/BannerAlert';
import useGraphQL from './use-graphql';
import keyGenerate from '../utils/string';

type MultiDelReturnType = {
  MultiDelCompo: () => ReactElement,
  status: string,
  handleDelete: (ids: string[]) => void
}
type MultiDelPropsType = {
  resolver: string,
  collection: Array<any>,
  getId: (item: any) => string,
  getItemText: (item: any) => string,
  modelNames: string
}

type ItemsStateType = Pick<MultiDelPropsType,
  'collection' | 'modelNames' |  'getId' | 'getItemText'> & {
  ids: string[],
  modal: string[],
  banner: string[]
}

type ActionType = 
  | { type: 'CLEAN' }
  | { type: 'UPDATE', payload: string[] }

function itemsReducer(
  state: ItemsStateType,
  action: ActionType
) {
  const {collection, modelNames, getId, getItemText} = state;

  function getDeletionStrings(texts: string[], future: boolean = false): string[] {
    const verb = (future) ? ' are marked for delete': ' has been deleted';
    return (texts.length === 0)
      ? [`There aren't ${modelNames} selected for removal`]
      : (texts.length < 11)
        ? [`The following ${modelNames} ${verb}:`, 
          ...texts]
        : [`${texts.length} ${modelNames} ${verb}`];
  }

  if(!collection || action.type === 'CLEAN' || collection.length === 0) {
    return {...state, ids: [], modal: [], banner: []};
  }
  // type = 'UPDATE'
  if (!action?.payload || !Array.isArray(action.payload)) throw new Error('bad request');

  const texts = collection.filter( (item: any) => {
    return (action.payload as string[]).includes(getId(item));
  }).map((item: any) => getItemText(item));

  return {
    ...state,
    ids: action.payload,
    modal: getDeletionStrings(texts, true),
    banner: getDeletionStrings(texts)
  }
}

export default function useMultipleDelete(props: MultiDelPropsType): MultiDelReturnType {
  const {resolver, modelNames, ...textArgs} = props;
  const [ status, setStatus ] = useState('inactive');
  const [ items, dispatchItems ] = useReducer(itemsReducer, {
    ids: [],
    modal: [],
    banner: [],
    modelNames,
    ...textArgs
  });
  const { data, errors, fetchData} = useGraphQL<number>(0);

  useEffect(() => {
    if(status === 'send' && items.ids.length > 0) {
      setStatus('sending');
      fetchData({expression: `mutation {
        multipleDelete: ${resolver}(ids: ["${items.ids.join('", "')}"])
      }`, isAuth: true});
    }
  }, [status, items, resolver, fetchData]);

  useEffect(() => {
    if(data && data > 0) {
      setStatus('finalized');
    }
  }, [data]);

  useEffect(() => {
    if(hasErrors(errors)) {
      setStatus('error')
    }
  }, [errors]);
 
  function handleDelete(ids: string[]) {
    dispatchItems({type: 'UPDATE', payload: ids});
    setStatus('confirm');
  }
    
  const MultiDelCompo = () => (
    <>
      <Dialog
        open={status === 'confirm'}
        onClose={() => setStatus('inactive')}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Do you want to permanently remove ${modelNames}?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component='div'>
            <List dense={true}>
              {items.modal.map((line) => (
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
            onClick={() => setStatus('inactive')}
            color="secondary"
            variant="contained"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => setStatus('send')}
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
        isOpen={!!data && data > 0 && status === 'finalized'}
        closeFn={() => setStatus('inactive')}
        title={`${modelNames} successfully deleted`}
        body={items.banner}
      />
      <BannerAlert
        severity="error"
        isOpen={status === 'error'}
        closeFn={() => setStatus('inactive')}
        title={`Error while deleting records of ${modelNames}`}
        body={errors || 'Server error'}
      />
    </>
  );

  return {status, MultiDelCompo, handleDelete}
}
