import classNames from 'classnames';
import PropTypes, { InferProps } from 'prop-types';

import { ALIGNMENTS } from './constants';

export default function PageNavBar(props: InferProps<typeof PageNavBar.propTypes>) {
  const classes = classNames(
    props.className,
    'page-nav-bar',
    props.alignment
  );

  const createDropdown = (link: any, index: number) => {
    return (
      <div key={ index } className='nav-link dropdown'>
        <a className='nav-link-content'>
          { link.icon && <i className={link.icon}></i> }
          { link.text }
        </a>
        <div className='dropdown-content'>
          { link.dropdown?.map((link: any, index: number) => createLink(link, index, 'p2')) }
        </div>
      </div>
    );
  };

  const createLink = (link: any, index: number, linkClasses?: string) => {
    return (
      <a
        key={ index }
        className={classNames('nav-link', linkClasses)}
        href={ link.href }
      >
        <div className='nav-link-content'>
          { link.icon && <i className={link.icon}></i> }
          { link.text }
        </div>
      </a>
    );
  };

  return (
    <div className={ classes }>
      {
        props.navLinks.map((link, index) => {
          if (link) {
            return link.dropdown ? createDropdown(link, index) : createLink(link, index);
          } else {
            return null;
          }
        })
      }
    </div>
  );
}

PageNavBar.propTypes = {
  className: PropTypes.string,

  /**
   * An array of links to display in the navigation bar.
   * Each can optionally have an icon and/or text.
   */
  navLinks: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string,
    text: PropTypes.string,
    href: PropTypes.string,
    dropdown: PropTypes.arrayOf(PropTypes.shape({
      icon: PropTypes.string,
      text: PropTypes.string,
      href: PropTypes.string.isRequired,
    }))
  })).isRequired,

  /**
   * The horizontal alignment of the navigation bar.
   */
  alignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL))
};

PageNavBar.defaultProps = {
  alignment: ALIGNMENTS.HORIZONTAL.LEFT
};
