import type { TSignatureObject } from '@/utils/types'
import type { Any as TypeAny } from 'protos/generated/google/protobuf/any'
import { Any } from 'google-protobuf/google/protobuf/any_pb'
import { Struct } from 'google-protobuf/google/protobuf/struct_pb'

export const createAnyFromObject = (obj: TSignatureObject): TypeAny => {
  const any = new Any()
  any.pack(Struct.fromJavaScript(obj).serializeBinary(), 'google.protobuf.Struct')
  return {
    typeUrl: any.getTypeUrl(),
    value: any.getValue_asU8(),
  }
}
