import { Button } from '@hilla/react-components/Button.js';
import { ConfirmDialog } from '@hilla/react-components/ConfirmDialog';
import { FormLayout } from '@hilla/react-components/FormLayout';
import { Grid } from '@hilla/react-components/Grid';
import { GridColumn } from '@hilla/react-components/GridColumn';
import { HorizontalLayout } from '@hilla/react-components/HorizontalLayout';
import { Icon } from '@hilla/react-components/Icon';
import { TextField } from '@hilla/react-components/TextField.js';
import UserModel from 'Frontend/generated/com/example/application/endpoints/helloreact/User';
import { User } from 'Frontend/generated/endpoints.js';
import { useEffect, useState } from 'react';

import '@vaadin/icons';
import { VerticalLayout } from '@hilla/react-components/VerticalLayout';
import { set } from '@polymer/polymer/lib/utils/path';

export default function HelloReactView() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [detailsUser, setDetailsUser] = useState<UserModel[]>([]);
  const [originalDetailsUser, setOriginalDetailsUser] = useState<UserModel[]>([]); // TODO: use this to discard changes
  const [detailsLocked, setDetailsLocked] = useState<boolean>(true);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [confirmDiscardChangesDialogOpen, setConfirmDiscardChangesDialogOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    const serverResponse: UserModel[] = await User.getAll();
    if (serverResponse.length == 0) {
      console.log("no users");
    } else {
      setUsers(serverResponse);
      serverResponse.forEach((user) => {
        console.log(user.name);
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // A row containing text input field for a user's name
  const UserRow = (user: UserModel) => (
    <div>
      <input type="text" value={user.name} />
    </div>
  );

  const createUserField = (
    <TextField label="Name" value="enter user name" />
  );

  // Creates and saves a new user, then appends it to the list of users
  const createUser = () => {
    User.newUser(`NewUser${Date.now()}`).then((newUser) => {
      console.log(`Created user ${newUser.name}`);
      setUsers([...users, newUser]);
    }).catch((error) => {
      console.error(error);
    });
  };

  const save = async () => {
    const serverResponse: UserModel = await User.save(detailsUser[0]);
    console.log(serverResponse);
    setDetailsUser([serverResponse]);
    setOriginalDetailsUser([{ ...serverResponse }]);
    setDetailsLocked(true);
    setUsers(users.map((user) => {
      if (user.id === serverResponse.id) {
        return serverResponse;
      } else {
        return user;
      }
    }));
  };

  const discardChanges = () => {
    console.log(`Discarding changes for user ${detailsUser[0].name}!`);
    setDetailsLocked(true);
    setDetailsUser([]);
    setOriginalDetailsUser([]);
  };

  const destroyUser = () => {
    console.log(`Destroying user ${detailsUser[0].name}!`);
    setDetailsLocked(true);
    setDetailsUser([]);
    setOriginalDetailsUser([]);
  };

  const detailsHasChanges = () => {
    const hasChanges = detailsUser[0] && detailsUser[0].name !== originalDetailsUser[0].name;
    console.log(`detailsHasChanges: ${hasChanges}`);
    return hasChanges;
  };

  return (
    <VerticalLayout
      theme="spacing"
      className="m-l"
    >
      <h2>Users</h2>
      <Grid
        theme="row-stripes"
        items={users}
        detailsOpenedItems={detailsUser}
        onActiveItemChanged={(e) => {
          console.log("active item changed");

          // If there are unsaved changes, show a confirmation dialog
          if (detailsHasChanges()) {
            setConfirmDiscardChangesDialogOpen(true);
            console.log("unsaved changes, open dialog");
            e.preventDefault();
          } else {
            // Otherwise, just set the active item
            const user = e.detail.value;
            console.log(user);

            setDetailsLocked(true);
            setDetailsUser(user ? [user] : []);
            setOriginalDetailsUser(user ? [{ ...user}] : []);
          }
        }}
        onSelectedItemsChanged={(e) => {
          console.log("selected items changed");
          console.log(e.detail.value);
        }}
        onChange={(e) => {
          console.log("grid change");
        }}
        rowDetailsRenderer={({ item: user }) => (
          <VerticalLayout
            // className="m-m"
            className={
              [
                'm-m',
                detailsHasChanges() ? 'border border-warning' : ''
              ].join(' ')
            }
          >
            <HorizontalLayout
              theme="spacing-l"
              style={{
                width: '100%',
                justifyContent: 'end'
              }}
            >
              {
                !detailsLocked && (
                  <>
                    <Button
                      theme="primary"
                      onClick={save}
                    >
                      <Icon icon="vaadin:check" />
                    </Button>
                    <Button
                      theme='icon error primary'
                      onClick={() => setConfirmDialogOpen(true)}
                    >
                      <Icon icon="vaadin:trash" />
                    </Button>
                    <ConfirmDialog
                      header="Delete user?"
                      cancelButtonVisible
                      confirmText="Delete"
                      confirmTheme="error primary"
                      cancelText="Cancel"
                      cancelTheme="primary"
                      opened={confirmDialogOpen}
                      onOpenedChanged={(e) => setConfirmDialogOpen(e.detail.value)}
                      onConfirm={destroyUser}
                    >
                      {`Are you sure you want to permanently delete ${user.name}?`}
                    </ConfirmDialog>
                    <ConfirmDialog
                      header="Discard changes?"
                      cancelButtonVisible
                      confirmText="Discard"
                      confirmTheme="warning primary"
                      cancelText="Cancel"
                      cancelTheme="primary"
                      opened={confirmDiscardChangesDialogOpen}
                      onOpenedChanged={(e) => setConfirmDiscardChangesDialogOpen(e.detail.value)}
                      onConfirm={discardChanges}
                    >
                      There are unsaved changes. Are you sure you want to discard them?
                    </ConfirmDialog>
                  </>
                )
              }
              <Button
                theme="icon"
                className="border"
                onClick={() => setDetailsLocked(!detailsLocked)}
              >
                <Icon icon={detailsLocked ? "vaadin:lock" : "vaadin:unlock"} />
              </Button>
            </HorizontalLayout>

            <FormLayout>
              <TextField
                label="Name"
                value={ user.name }
                readonly={detailsLocked}
                onChange={(e) => {
                  user.name = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                  console.log(`Setting name to ${user.name}`);

                  setDetailsUser([{ ...user }]);
                }

              }
              />
            </FormLayout>
          </VerticalLayout>
        )}
      >
        <GridColumn header="Id" flexGrow={0}>
          {({ item }) => (<div>{item.id}</div>)}
        </GridColumn>
        <GridColumn path="name" header="Name" autoWidth />
      </Grid>

      <Button onClick={createUser}>Create User</Button>
    </VerticalLayout>
  );
}
