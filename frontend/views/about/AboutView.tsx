import Page from "Frontend/components/Page";
import { pageFooter, pageHeaderLinks } from "../Main";

export default function AboutView() {
  return (
    <Page
      navLinks={pageHeaderLinks}
      footer={pageFooter}
    >
      <div className='m2 p2 vertical center'>
        <img style={{ width: '200px' }} src="images/empty-plant.png" />
        <h2>This place intentionally left empty</h2>
      </div>
    </Page>

  );
}
