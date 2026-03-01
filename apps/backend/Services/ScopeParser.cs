using System.Text;
using System.Text.RegularExpressions;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using ControlPlane.Backend.Models;

namespace ControlPlane.Backend.Services;

public class ScopeParser
{
    private static readonly ISerializer _yamlSerializer = new SerializerBuilder()
        .WithNamingConvention(UnderscoredNamingConvention.Instance)
        .Build();

    private static readonly IDeserializer _yamlDeserializer = new DeserializerBuilder()
        .WithNamingConvention(UnderscoredNamingConvention.Instance)
        .IgnoreUnmatchedProperties()
        .Build();

    public static Scope Parse(string content)
    {
        var parts = content.Split(new[] { "---" }, StringSplitOptions.None);

        if (parts.Length < 3)
        {
            throw new InvalidOperationException("Invalid markdown format");
        }

        var yamlContent = parts[1].Trim();
        var bodyContent = parts[2].Trim();

        var metadata = _yamlDeserializer.Deserialize<ScopeMetadata>(yamlContent);
        var sections = ExtractSections(bodyContent);

        return new Scope
        {
            metadata = metadata,
            description = sections.GetValueOrDefault("description", ""),
            inputs = sections.GetValueOrDefault("inputs", ""),
            outputs = sections.GetValueOrDefault("outputs", ""),
            memory = sections.GetValueOrDefault("memory_working_notes", ""),
            result = sections.GetValueOrDefault("result", "")
        };
    }

    public static string Serialize(Scope scope)
    {
        var yaml = _yamlSerializer.Serialize(scope.metadata);

        var body = $@"
## Description

{scope.description}

## Inputs

{scope.inputs}

## Outputs

{scope.outputs}

## Memory / Working Notes

{scope.memory}

## Result

{scope.result}
";

        return $"---\n{yaml.Trim()}\n---\n{body.Trim()}\n";
    }

    private static Dictionary<string, string> ExtractSections(string content)
    {
        var sections = new Dictionary<string, string>();
        var regex = new Regex(@"^## (.+)$", RegexOptions.Multiline);
        var matches = regex.Matches(content);

        for (int i = 0; i < matches.Count; i++)
        {
            var match = matches[i];
            var sectionName = match.Groups[1].Value
                .ToLower()
                .Replace(" ", "_")
                .Replace("/", "_");

            var startIndex = match.Index + match.Length;
            var endIndex = i < matches.Count - 1 ? matches[i + 1].Index : content.Length;

            sections[sectionName] = content.Substring(startIndex, endIndex - startIndex).Trim();
        }

        return sections;
    }
}
