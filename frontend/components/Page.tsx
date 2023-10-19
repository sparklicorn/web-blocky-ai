import classNames from 'classnames';
import PropTypes from 'prop-types';

import {
  ALIGNMENTS,
  PropTypesWithChildren
} from './constants';
import PageFooter from './PageFooter';
import PageNavBar from './PageNavBar';

type HasFooter = {
  /**
   * The footer content to render at the bottom of the page.
   */
  footer?: React.ReactNode;
};

export default function Page(
  props: PropTypesWithChildren<typeof Page.propTypes> & HasFooter
) {
  const classes = classNames([
    props.className,
    'page'
  ]);

  return (
    <div className={ classes }>
      <PageNavBar
        navLinks={ props.navLinks }
        alignment={ALIGNMENTS.HORIZONTAL.LEFT}
      ></PageNavBar>
      { props.children }
      {
        props.footer && (
          <PageFooter
            sticky={ props.stickyFooter }
            alignment={ props.footerAlignment }
          >
            { props.footer }
          </PageFooter>
        )
      }
    </div>
  );
}

Page.propTypes = {
  className: PropTypes.string,

  /**
   * An array of links to display in the navigation bar.
   * Each can optionally have an icon and/or text.
   */
  navLinks: PageNavBar.propTypes.navLinks,

  /**
   * Whether the footer should stick to the bottom of the page.
   */
  stickyFooter: PropTypes.bool,

  /**
   * The horizontal alignment of the footer.
   */
  footerAlignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL))
};

Page.defaultProps = {
  stickyFooter: true,
  footerAlignment: ALIGNMENTS.HORIZONTAL.LEFT,
};
