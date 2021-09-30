import {TokenService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {toJSON} from '@loopback/testlab';
import * as _ from 'lodash';
import {promisify} from 'util';
import {UserRepository} from '../../repositories';
import {TokenServiceConstants} from '../keys';
import {AuthCredential, AuthUser} from '../types';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async verifyToken(token: string): Promise<AuthUser> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    const decryptedToken = await verifyAsync(
      token,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    const userProfile = _.pick(decryptedToken, [
      'id',
      'email',
      'name',
      `permissions`,
    ]);
    const res: AuthUser = {
      [securityId]: userProfile.id,
      ...userProfile,
    };
    return res;
  }

  async generateToken(userProfile: AuthUser): Promise<string> {
    const token = await signAsync(
      userProfile,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
      {
        expiresIn: TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
      },
    );
    return token;
  }

  async getToken(credential: AuthCredential): Promise<string> {
    const foundUser = await this.userRepository.findOne({
      where: {email: credential.email},
    });
    if (!foundUser) {
      throw new HttpErrors['NotFound'](
        `User with email ${credential.email} not found.`,
      );
    }

    if (credential.password !== foundUser.password) {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }
    const currentUser: AuthUser = _.pick(toJSON(foundUser), [
      'id',
      'email',
      'name',
      'permissions',
    ]) as AuthUser;
    const token = await this.generateToken(currentUser);
    return token;
  }
}
