import {Redirect} from 'expo-router';

/** Retired visitor deep link; transport is available from the business account. */
export default function RetiredVisitorTransport() {
  return <Redirect href="/account"/>;
}
