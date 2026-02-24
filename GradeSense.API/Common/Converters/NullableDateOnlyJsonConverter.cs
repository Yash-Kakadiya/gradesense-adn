using System.Text.Json;
using System.Text.Json.Serialization;

namespace GradeSense.API.Common.Converters
{
    public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        private const string Format = "yyyy-MM-dd";

        public override DateOnly? Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }
            
            var str = reader.GetString();
            if (string.IsNullOrEmpty(str))
            {
                return null;
            }
            
            return DateOnly.ParseExact(str, Format);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DateOnly? value,
            JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                writer.WriteStringValue(value.Value.ToString(Format));
            }
            else
            {
                writer.WriteNullValue();
            }
        }
    }
}
