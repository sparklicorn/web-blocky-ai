import PropTypes from 'prop-types';

export type PropTypesWithChildren<T> = PropTypes.InferProps<T> & {
  children: React.ReactNode;
};

export const ORIENTATIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

export const ALIGNMENTS = {
  HORIZONTAL: {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
  },
  VERTICAL: {
    TOP: 'top',
    CENTER: 'center',
    BOTTOM: 'bottom',
  }
}
