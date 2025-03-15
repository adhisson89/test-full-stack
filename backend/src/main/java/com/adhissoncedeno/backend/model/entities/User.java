package com.adhissoncedeno.backend.model.entities;

import com.adhissoncedeno.backend.model.enums.Role;
import jakarta.persistence.*;


import java.util.List;


@Entity
@Table(name = "users")
public class User {

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, name = "username")
    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, targetEntity = Post.class, cascade = CascadeType.ALL)
    private List<Post> posts;

}
