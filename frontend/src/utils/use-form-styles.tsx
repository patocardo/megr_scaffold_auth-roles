import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useFormStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    marginedTop: {
      marginTop: theme.spacing(2),
    }
  })
);

export default useFormStyles;