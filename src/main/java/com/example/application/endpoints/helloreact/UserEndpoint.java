package com.example.application.endpoints.helloreact;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.Endpoint;
import dev.hilla.Nonnull;

@Endpoint("User")
@AnonymousAllowed
public class UserEndpoint {

    @Autowired
    private UserRepository service;

    public UserEndpoint(UserRepository service) {
        this.service = service;
    }

    private void validateUserName(String userName) {
        if (userName == null || userName.isEmpty()) {
            throw new IllegalArgumentException("Username must not be empty");
        }
    }

    @Nonnull
    public User newUser(String userName) {
        validateUserName(userName);
        return service.save(new User(userName));
    }

    @Nonnull
    public User save(User user) {
        validateUserName(user.getName());
        return service.save(user);
    }

    public List<@Nonnull User> saveAll(Iterable<User> users) {
        users.forEach(user -> validateUserName(user.getName()));
        service.saveAll(users);
        return getAll();
    }

    @Nonnull
    public List<@Nonnull User> getAll() {
        List<User> users = new ArrayList<>();
        service.findAll().forEach(users::add);
        users.sort((userA, userB) -> userA.getId() - userB.getId());
        return users;
    }
}
