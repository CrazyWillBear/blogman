import hashlib


class Hash:
    """
    Hashes strings using SHA-256.

    All methods are static, only important method is hash().
    """

    @staticmethod
    def hash(content: str) -> str:
        """
        Returns the SHA-256 hash of a string.

        Returns:
            str: The SHA-256 hash of a string.
        """
        hash_obj = hashlib.sha256(content.encode())
        return hash_obj.hexdigest()
