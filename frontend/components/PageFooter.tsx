import classNames from 'classnames';
import PropTypes from 'prop-types';
import { ALIGNMENTS, PropTypesWithChildren } from './constants';

export default function PageFooter(
  props: PropTypesWithChildren<typeof PageFooter.propTypes>
) {
  const classes = classNames(
    props.className,
    'page-footer',
    props.alignment,
    { 'sticky': props.sticky }
  );

  return (
    <div
      className={ classes }
    >
      { props.children }
    </div>
  );
}

PageFooter.propTypes = {
  className: PropTypes.string,

  /**
   * Whether the footer should stick to the bottom of the page.
   */
  sticky: PropTypes.bool,

  /**
   * The horizontal alignment of the footer.
   */
  alignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL))
};
