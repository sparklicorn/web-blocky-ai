import classNames from "classnames";
import PropTypes, { InferProps } from "prop-types";
import { PropsWithChildren } from "react";

import { ALIGNMENTS } from "./constants";

type HasHeader = {
  /**
   * The header content to render at the top of the Card.
   */
  header?: React.ReactNode;
};

type HasFooter = {
  /**
   * The footer content to render at the bottom of the Card.
   */
  footer?: React.ReactNode;
};

export default function Card(
  props: PropsWithChildren<InferProps<typeof Card.propTypes>> &
    HasHeader &
    HasFooter
) {
  return (

    <div className={classNames('card', props.className)}>
      <div className={classNames('card-header', props.headerAlignment)}>
        {
          props.headerIcon && (
            <i className={classNames('fa-solid', props.headerIcon)}></i>
          )
        }
        {props.header}
      </div>

      <div className={classNames('card-content', props.contentAlignment)}>
        {props.children}
      </div>

      <div className={classNames('card-footer', props.footerAlignment)}>
        {props.footer}
      </div>
    </div>
  )
}

Card.propTypes = {
  className: PropTypes.string,

  /**
   * The icon to display in the header.
   */
  headerIcon: PropTypes.string,

  /**
   * The horizontal alignment of the header. Defaults left.
   */
  headerAlignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL)),

  /**
   * The horizontal alignment of the content. Defaults left.
   */
  contentAlignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL)),

  /**
   * The horizontal alignment of the footer. Defaults right.
   */
  footerAlignment: PropTypes.oneOf(Object.values(ALIGNMENTS.HORIZONTAL))
};

Card.defaultProps = {
  headerAlignment: ALIGNMENTS.HORIZONTAL.LEFT,
  contentAlignment: ALIGNMENTS.HORIZONTAL.LEFT,
  footerAlignment: ALIGNMENTS.HORIZONTAL.RIGHT
};
