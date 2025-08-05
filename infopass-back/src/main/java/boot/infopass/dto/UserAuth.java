package boot.infopass.dto;

import lombok.Data;

//회원 권한
@Data
public class UserAuth {
 
 private int authNo;
 private String email;
 private String auth;

 public UserAuth() {

 }

 public UserAuth(String email, String auth) {
     this.email = email;
     this.auth = auth;
 }

 
}