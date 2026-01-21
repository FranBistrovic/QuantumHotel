package com.quantumhotel.users;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.services.UserService;
import com.quantumhotel.users.dto.NewUserDto;
import com.quantumhotel.users.dto.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SessionRegistry sessionRegistry;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // =========================
    // updateMe
    // =========================

    @Test
    void updateMe_partialUpdate_success() {
        User user = baseUser();
        UserService.UpdateMeRequest req = new UserService.UpdateMeRequest();
        req.firstName = "Ivana";
        req.city = "Zagreb";

        when(userRepository.save(user)).thenReturn(user);

        UserDto dto = userService.updateMe(user, req);

        assertEquals("Ivana", dto.firstName());
        assertEquals("Zagreb", dto.city());
    }

    @Test
    void updateMe_uniqueConstraintViolation_throws409() {
        User user = baseUser();
        UserService.UpdateMeRequest req = new UserService.UpdateMeRequest();
        req.email = "duplicate@mail.com";

        when(userRepository.save(user))
                .thenThrow(DataIntegrityViolationException.class);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> userService.updateMe(user, req)
        );

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    // =========================
    // deleteMe
    // =========================

    @Test
    void deleteMe_softDelete() {
        User user = baseUser();

        userService.deleteMe(user);

        assertFalse(user.isEnabled());
        assertNotNull(user.getDeletedAt());
    }

    // =========================
    // adminCreateUser
    // =========================

    @Test
    void adminCreateUser_localWithoutPassword_throws400() {
        UserService.AdminCreateUserRequest req =
                new UserService.AdminCreateUserRequest();
        req.username = "test";
        req.provider = AuthProvider.LOCAL;

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> userService.adminCreateUser(req)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void adminCreateUser_success() {
        UserService.AdminCreateUserRequest req =
                new UserService.AdminCreateUserRequest();
        req.username = "admin1";
        req.password = "secret";
        req.role = Role.ADMIN;

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserDto dto = userService.adminCreateUser(req);

        assertEquals("admin1", dto.username());
        assertEquals("ADMIN", dto.role());
    }

    // =========================S
    // adminPatchUser
    // =========================

    @Test
    void adminPatchUser_updatesFields() {
        User user = baseUser();
        user.setId(1L);

        UserService.AdminPatchUserRequest req =
                new UserService.AdminPatchUserRequest();
        req.city = "Split";
        req.gender = Gender.FEMALE;

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UserDto dto = userService.adminPatchUser(1L, req);

        assertEquals("Split", dto.city());
        assertEquals("FEMALE", dto.gender());
    }

    // =========================
    // adminUpdateRole
    // =========================

    @Test
    void adminUpdateRole_success() {
        User user = baseUser();
        user.setId(1L);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));
        when(userRepository.save(user))
                .thenReturn(user);

        UserDto dto = userService.adminUpdateRole(1L, Role.ADMIN);

        assertEquals("ADMIN", dto.role());
    }

    @Test
    void adminUpdateRole_nullRole_throws400() {
        assertThrows(ResponseStatusException.class,
                () -> userService.adminUpdateRole(1L, null));
    }

    // =========================
    // helpers
    // =========================

    private User baseUser() {
        User u = new User();
        u.setUsername("user1");
        u.setEmail("user@test.com");
        u.setRole(Role.USER);
        u.setEnabled(true);
        u.setDateOfBirth(LocalDate.of(1995, 1, 1));
        return u;
    }
}
